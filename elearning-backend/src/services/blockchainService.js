const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

class BlockchainService {
  constructor() {
    this.contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
    this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    this.adminPrivateKey = process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY;

    if (!this.contractAddress) {
      console.warn('⚠️  BLOCKCHAIN_CONTRACT_ADDRESS is not set. Certificate minting will fail.');
    }
    if (!this.adminPrivateKey) {
      console.warn('⚠️  BLOCKCHAIN_ADMIN_PRIVATE_KEY is not set. Certificate minting will fail.');
    }

    this.contractABI = this.loadContractABI();
    
    this.provider = null;
    this.signer = null;
    this.contract = null;
    
    if (this.contractAddress && this.adminPrivateKey) {
      this.initialize();
    }
  }

  loadContractABI() {
    try {
      const abiPath = path.join(
        __dirname,
        '../../../blockchain-service/artifacts/contracts/AcademicCertificate.sol/AcademicCertificate.json'
      );
      
      if (fs.existsSync(abiPath)) {
        const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        return contractData.abi;
      } else {
        console.warn('⚠️  Contract ABI file not found. Using minimal ABI.');
        return [
          {
            "inputs": [
              { "internalType": "address", "name": "recipient", "type": "address" },
              { "internalType": "string", "name": "tokenURI", "type": "string" },
              { "internalType": "uint256", "name": "certificateId", "type": "uint256" }
            ],
            "name": "issueCertificate",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "anonymous": false,
            "inputs": [
              { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
              { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
              { "indexed": true, "internalType": "uint256", "name": "certificateId", "type": "uint256" },
              { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" }
            ],
            "name": "CertificateIssued",
            "type": "event"
          }
        ];
      }
    } catch (error) {
      console.error('❌ Error loading contract ABI:', error.message);
      throw new Error('Failed to load contract ABI');
    }
  }

  initialize() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const privateKey = this.adminPrivateKey.startsWith('0x') 
        ? this.adminPrivateKey 
        : `0x${this.adminPrivateKey}`;
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer
      );

      console.log('✅ Blockchain service initialized');
      console.log(`   Contract Address: ${this.contractAddress}`);
      console.log(`   RPC URL: ${this.rpcUrl}`);
      console.log(`   Admin Address: ${this.signer.address}`);
    } catch (error) {
      console.error('❌ Error initializing blockchain service:', error);
      throw error;
    }
  }

  async mintCertificateOnChain(recipientAddress, metadataUrl, certificateId) {
    try {
      if (!recipientAddress || !metadataUrl || !certificateId) {
        throw new Error('Missing required parameters: recipientAddress, metadataUrl, and certificateId are required');
      }
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error(`Invalid recipient address: ${recipientAddress}`);
      }
      if (!this.contract) {
        throw new Error('Blockchain service not initialized. Please check BLOCKCHAIN_CONTRACT_ADDRESS and BLOCKCHAIN_ADMIN_PRIVATE_KEY in .env');
      }

      console.log(`📝 Minting certificate ${certificateId} to ${recipientAddress}...`);
      console.log(`   Contract Address: ${this.contractAddress}`);
      console.log(`   RPC URL: ${this.rpcUrl}`);

      let tx = null;
      try {
        tx = await this.contract.issueCertificate(
            recipientAddress,
            metadataUrl,
            certificateId
          );

        console.log('tx', tx);

      } catch (error) {
        console.error('Error minting certificate:', error);
        throw new Error(`Blockchain error: ${error.message || 'Failed to mint certificate on chain'}`);
      }
      
    //   // Gọi function và đợi transaction
    //   const tx = await this.contract.issueCertificate(
    //     recipientAddress,
    //     metadataUrl,
    //     certificateId
    //   );

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      const networkName = this.getNetworkName();
      console.log(`   Network: ${networkName}`);
      
      // Đợi transaction được confirm với timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
        )
      ]);
      
      // Kiểm tra transaction status
      if (receipt.status === 0) {
        throw new Error(`Transaction failed. Hash: ${tx.hash}`);
      }
      
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);

      let tokenId = null;

      // Cách 1: Parse event logs từ receipt
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // Tạo event filter từ contract
          const eventFilter = this.contract.filters.CertificateIssued();
          const events = await this.contract.queryFilter(eventFilter, receipt.blockNumber, receipt.blockNumber);
          
          // Tìm event có certificateId khớp
          for (const event of events) {
            if (event.args && event.args.certificateId && event.args.certificateId.toString() === certificateId.toString()) {
              tokenId = event.args.tokenId.toString();
              console.log(`✅ Found Token ID from event: ${tokenId}`);
              break;
            }
          }
        } catch (eventError) {
          console.warn('⚠️  Error parsing events:', eventError.message);
        }
      }

      // Cách 2: Nếu không tìm thấy trong events, query trực tiếp từ contract
      if (!tokenId) {
        try {
          console.log(`🔍 Querying Token ID from contract for certificate ${certificateId}...`);
          const tokenIdFromContract = await this.contract.certificateIdToTokenId(certificateId);
          if (tokenIdFromContract && tokenIdFromContract.toString() !== '0') {
            tokenId = tokenIdFromContract.toString();
            console.log(`✅ Found Token ID from contract: ${tokenId}`);
          }
        } catch (queryError) {
          console.warn('⚠️  Error querying Token ID from contract:', queryError.message);
        }
      }

      // Cách 3: Parse logs thủ công nếu vẫn chưa có
      if (!tokenId && receipt.logs && receipt.logs.length > 0) {
        try {
          const eventInterface = new ethers.Interface(this.contractABI);
          for (const log of receipt.logs) {
            try {
              // Kiểm tra xem log có phải từ contract này không
              if (log.address.toLowerCase() !== this.contractAddress.toLowerCase()) {
                continue;
              }
              
              const parsedLog = eventInterface.parseLog(log);
              if (parsedLog && parsedLog.name === 'CertificateIssued') {
                // Kiểm tra certificateId có khớp không
                if (parsedLog.args.certificateId && parsedLog.args.certificateId.toString() === certificateId.toString()) {
                  tokenId = parsedLog.args.tokenId.toString();
                  console.log(`✅ Found Token ID from manual log parsing: ${tokenId}`);
                  break;
                }
              }
            } catch (parseError) {
              // Ignore logs that are not CertificateIssued event
            }
          }
        } catch (parseError) {
          console.warn('⚠️  Error in manual log parsing:', parseError.message);
        }
      }

      if (!tokenId) {
        console.warn(`⚠️  Could not find Token ID in transaction receipt for certificate ${certificateId}.`);
        console.warn(`   Transaction Hash: ${tx.hash}`);
        console.warn(`   Block Number: ${receipt.blockNumber}`);
        console.warn(`   Network: ${this.rpcUrl}`);
        console.warn(`   You may need to query the contract manually using certificateIdToTokenId(${certificateId})`);
        console.warn(`   Or check the transaction on blockchain explorer`);
        
        // Nếu là local network, hướng dẫn khác
        if (this.rpcUrl.includes('localhost') || this.rpcUrl.includes('127.0.0.1')) {
          console.warn(`   Note: This is a local network transaction. It won't appear on public explorers like Etherscan.`);
        } else {
          // Tạo explorer URL
          const explorerUrl = this.getExplorerUrl(tx.hash);
          if (explorerUrl) {
            console.warn(`   Check transaction: ${explorerUrl}`);
          }
        }
      }

      return { transactionHash: tx.hash, tokenId };
    } catch (error) {
      console.error(`❌ Error minting certificate ${certificateId} on chain:`, error);
      throw new Error(`Blockchain error: ${error.message || 'Failed to mint certificate on chain'}`);
    }
  }

  async isCertificateMinted(certificateId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }
      
      const tokenId = await this.contract.certificateIdToTokenId(certificateId);
      return tokenId.toString() !== '0';
    } catch (error) {
      console.error(`Error checking if certificate ${certificateId} is minted:`, error);
      return false;
    }
  }

  async getTokenIdByCertificateId(certificateId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }
      
      const tokenId = await this.contract.certificateIdToTokenId(certificateId);
      return tokenId.toString();
    } catch (error) {
      console.error(`Error getting token ID for certificate ${certificateId}:`, error);
      throw error;
    }
  }

  getNetworkName() {
    if (this.rpcUrl.includes('localhost') || this.rpcUrl.includes('127.0.0.1')) {
      return 'Local Network';
    } else if (this.rpcUrl.includes('sepolia') || this.rpcUrl.includes('11155111')) {
      return 'Sepolia Testnet';
    } else if (this.rpcUrl.includes('amoy') || this.rpcUrl.includes('80002')) {
      return 'Polygon Amoy Testnet';
    } else if (this.rpcUrl.includes('mainnet') || this.rpcUrl.includes('ethereum')) {
      return 'Ethereum Mainnet';
    } else if (this.rpcUrl.includes('polygon')) {
      return 'Polygon Network';
    } else {
      return 'Unknown Network';
    }
  }

  getExplorerUrl(txHash) {
    if (this.rpcUrl.includes('localhost') || this.rpcUrl.includes('127.0.0.1')) {
      return null; // Local network không có explorer
    }
    
    // Polygon Amoy
    if (this.rpcUrl.includes('amoy') || this.rpcUrl.includes('80002')) {
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    }
    
    // Sepolia
    if (this.rpcUrl.includes('sepolia') || this.rpcUrl.includes('11155111')) {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
    
    // Ethereum Mainnet
    if (this.rpcUrl.includes('mainnet') || this.rpcUrl.includes('ethereum')) {
      return `https://etherscan.io/tx/${txHash}`;
    }
    
    // Polygon Mainnet
    if (this.rpcUrl.includes('polygon') && !this.rpcUrl.includes('amoy')) {
      return `https://polygonscan.com/tx/${txHash}`;
    }
    
    return null;
  }
}

module.exports = new BlockchainService();
