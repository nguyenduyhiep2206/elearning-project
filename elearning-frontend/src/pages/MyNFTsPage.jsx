import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';

const MyNFTsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { account, isConnected, connect, provider } = useWallet();
  
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadataCache, setMetadataCache] = useState({});

  // Contract ABI
  const CONTRACT_ABI = [
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function getCertificateIdByTokenId(uint256 tokenId) public view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ];

  const CONTRACT_ADDRESS = import.meta.env.VITE_BLOCKCHAIN_CONTRACT_ADDRESS || '';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isConnected && account && CONTRACT_ADDRESS) {
      loadNFTs();
    }
  }, [isConnected, account, CONTRACT_ADDRESS]);

  const loadNFTs = async () => {
    if (!isConnected || !account || !CONTRACT_ADDRESS) {
      setError('Vui lòng kết nối với Metamask và đảm bảo contract address đã được cấu hình');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('Metamask chưa được cài đặt');
      }

      // Validate contract address format
      if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        throw new Error(`Contract address không hợp lệ: ${CONTRACT_ADDRESS}`);
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Kiểm tra network
      const network = await web3Provider.getNetwork();
      console.log('Current network:', network.name, 'Chain ID:', network.chainId.toString());
      
      // Kiểm tra contract có code không (contract đã được deploy chưa)
      console.log('🔍 Checking contract code at:', CONTRACT_ADDRESS);
      console.log('🔍 Network:', network.name, 'Chain ID:', network.chainId.toString());
      
      const code = await web3Provider.getCode(CONTRACT_ADDRESS);
      console.log('🔍 Contract code length:', code.length, 'bytes');
      
      if (code === '0x' || code === '0x0' || code.length <= 2) {
        // Kiểm tra network có đúng không
        const expectedChainId = 80002; // Polygon Amoy
        const currentChainId = network.chainId.toString();
        
        let errorMessage = `Contract chưa được deploy tại địa chỉ ${CONTRACT_ADDRESS}.\n\n`;
        
        if (currentChainId !== expectedChainId.toString()) {
          errorMessage += `⚠️ Network không đúng!\n`;
          errorMessage += `   Đang ở: ${network.name} (Chain ID: ${currentChainId})\n`;
          errorMessage += `   Cần: Polygon Amoy (Chain ID: ${expectedChainId})\n\n`;
          
          // Nếu đang ở local network (31337), hướng dẫn cụ thể hơn
          if (currentChainId === '31337') {
            errorMessage += `Bạn đang ở Hardhat Local Network!\n`;
            errorMessage += `Contract đã được deploy trên Polygon Amoy, không phải local network.\n\n`;
          }
          
          errorMessage += `Vui lòng:\n`;
          errorMessage += `1. Mở Metamask\n`;
          errorMessage += `2. Click vào network dropdown (góc trên bên phải)\n`;
          errorMessage += `3. Chọn "Add Network" hoặc "Add a network manually"\n`;
          errorMessage += `4. Điền thông tin:\n`;
          errorMessage += `   - Network Name: Polygon Amoy\n`;
          errorMessage += `   - RPC URL: https://rpc-amoy.polygon.technology\n`;
          errorMessage += `   - Chain ID: 80002\n`;
          errorMessage += `   - Currency: MATIC\n`;
          errorMessage += `   - Block Explorer: https://amoy.polygonscan.com\n`;
          errorMessage += `5. Click "Save" và chuyển sang Polygon Amoy\n\n`;
          errorMessage += `Hoặc dùng Chainlist (dễ hơn):\n`;
          errorMessage += `1. Truy cập: https://chainlist.org/\n`;
          errorMessage += `2. Tìm "Polygon Amoy"\n`;
          errorMessage += `3. Click "Connect Wallet" và "Add to Metamask"\n\n`;
        } else {
          errorMessage += `Vui lòng:\n`;
          errorMessage += `1. Kiểm tra contract trên Polygonscan:\n`;
          errorMessage += `   https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}\n\n`;
          errorMessage += `2. Nếu contract chưa deploy, chạy:\n`;
          errorMessage += `   cd blockchain-service && npm run deploy:amoy\n\n`;
          errorMessage += `3. Copy contract address và cập nhật vào VITE_BLOCKCHAIN_CONTRACT_ADDRESS trong .env\n\n`;
          errorMessage += `4. Restart frontend server (Ctrl+C và chạy lại npm run dev)\n\n`;
        }
        
        errorMessage += `Debug info:\n`;
        errorMessage += `- Contract Address: ${CONTRACT_ADDRESS}\n`;
        errorMessage += `- Network: ${network.name} (Chain ID: ${currentChainId})\n`;
        errorMessage += `- Contract Code: ${code.substring(0, 10)}... (${code.length} bytes)`;
        
        throw new Error(errorMessage);
      }
      
      console.log('✅ Contract code found, length:', code.length);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider);

      // Kiểm tra contract có function balanceOf không bằng cách gọi với try-catch
      let balance;
      try {
        balance = await contract.balanceOf(account);
      } catch (balanceError) {
        if (balanceError.code === 'BAD_DATA' || balanceError.message.includes('could not decode')) {
          throw new Error(
            `Không thể gọi function balanceOf. Có thể:\n` +
            `1. Contract address không đúng\n` +
            `2. Contract không phải là ERC721\n` +
            `3. Network không đúng (đang ở ${network.name}, cần Polygon Amoy - Chain ID: 80002)`
          );
        }
        throw balanceError;
      }
      
      const balanceNumber = parseInt(balance.toString());

      if (balanceNumber === 0) {
        setNfts([]);
        setIsLoading(false);
        return;
      }

      // Lấy tất cả token IDs
      const tokenPromises = [];
      for (let i = 0; i < balanceNumber; i++) {
        tokenPromises.push(contract.tokenOfOwnerByIndex(account, i));
      }

      const tokenIds = await Promise.all(tokenPromises);
      
      // Lấy metadata cho từng NFT
      const nftPromises = tokenIds.map(async (tokenIdBigInt) => {
        const tokenId = tokenIdBigInt.toString();
        
        try {
          // Lấy tokenURI
          const tokenURI = await contract.tokenURI(tokenId);
          
          // Lấy certificateId
          let certificateId = null;
          try {
            certificateId = await contract.getCertificateIdByTokenId(tokenId);
            certificateId = certificateId.toString();
          } catch (err) {
            console.warn(`Could not get certificateId for token ${tokenId}:`, err);
          }

          // Fetch metadata từ URI
          let metadata = null;
          if (tokenURI && tokenURI.startsWith('http')) {
            try {
              const response = await fetch(tokenURI);
              metadata = await response.json();
            } catch (err) {
              console.warn(`Could not fetch metadata from ${tokenURI}:`, err);
            }
          }

          return {
            tokenId,
            certificateId,
            tokenURI,
            metadata,
            owner: account
          };
        } catch (err) {
          console.error(`Error loading NFT ${tokenId}:`, err);
          return {
            tokenId: tokenId.toString(),
            certificateId: null,
            tokenURI: null,
            metadata: null,
            error: err.message
          };
        }
      });

      const nftData = await Promise.all(nftPromises);
      setNfts(nftData.filter(nft => nft !== null));

    } catch (err) {
      console.error('Error loading NFTs:', err);
      
      let errorMessage = 'Không thể tải NFT từ blockchain';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'BAD_DATA') {
        errorMessage = 'Contract address không đúng hoặc contract chưa được deploy. Vui lòng kiểm tra lại.';
      } else if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Không thể kết nối đến contract. Vui lòng kiểm tra network và contract address.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra RPC URL và kết nối internet.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Kết nối với Metamask</h2>
            <p className="text-gray-600 mb-6">
              Vui lòng kết nối với Metamask để xem các chứng chỉ NFT trong ví của bạn.
            </p>
            <button
              onClick={connect}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Kết nối Metamask
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!CONTRACT_ADDRESS) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Contract Address chưa được cấu hình
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              Để xem NFT trong ví, bạn cần cấu hình biến môi trường <code className="bg-yellow-100 px-2 py-1 rounded">VITE_BLOCKCHAIN_CONTRACT_ADDRESS</code> trong file <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> của frontend.
            </p>
            <p className="text-yellow-700 text-sm">
              Ví dụ: <code className="bg-yellow-100 px-2 py-1 rounded">VITE_BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3</code>
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-medium mb-2">Hướng dẫn:</h4>
            <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
              <li>Tạo file <code className="bg-blue-100 px-1 rounded">.env</code> trong thư mục <code className="bg-blue-100 px-1 rounded">elearning-frontend</code></li>
              <li>Thêm dòng: <code className="bg-blue-100 px-1 rounded">VITE_BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3</code></li>
              <li>Restart frontend server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Chứng chỉ trong ví</h1>
            <p className="text-gray-600">
              Danh sách các chứng chỉ NFT bạn sở hữu trên blockchain
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Địa chỉ ví: <span className="font-mono">{account}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          )}

          {/* NFTs List */}
          {!isLoading && nfts.length === 0 && !error && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Bạn chưa có NFT chứng chỉ nào trong ví này
              </h3>
              <p className="text-gray-600 mb-4">
                Hoàn thành khóa học và phát hành chứng chỉ để nhận NFT.
              </p>
              <button
                onClick={loadNFTs}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Tải lại
              </button>
            </div>
          )}

          {/* NFTs Grid */}
          {!isLoading && nfts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft) => (
                <div
                  key={nft.tokenId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* NFT Image */}
                  {nft.metadata?.image ? (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={nft.metadata.image}
                        alt={nft.metadata.name || 'Certificate NFT'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Certificate';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-white opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="p-6">
                    {/* NFT Name */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {nft.metadata?.name || `Certificate NFT #${nft.tokenId}`}
                    </h3>

                    {/* NFT Description */}
                    {nft.metadata?.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {nft.metadata.description}
                      </p>
                    )}

                    {/* NFT Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Token ID: #{nft.tokenId}</span>
                      </div>

                      {nft.certificateId && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Certificate ID: #{nft.certificateId}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {nft.certificateId && (
                        <a
                          href={`/certificates/${nft.certificateId}`}
                          className="w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
                        >
                          Xem chi tiết
                        </a>
                      )}
                      {nft.tokenURI && (
                        <a
                          href={nft.tokenURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                        >
                          Xem Metadata
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh Button */}
          {!isLoading && (
            <div className="mt-6 text-center">
              <button
                onClick={loadNFTs}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tải lại danh sách
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default MyNFTsPage;

