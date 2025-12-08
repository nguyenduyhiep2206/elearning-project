require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper function to validate and format private key
function getPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return [];
  }
  
  // Remove placeholder values
  if (privateKey.includes('your_private_key') || 
      privateKey.includes('YOUR_PRIVATE_KEY') ||
      privateKey.length < 64) {
    console.warn('⚠️  PRIVATE_KEY trong .env có vẻ không đúng. Vui lòng thay bằng private key thật của bạn.');
    return [];
  }
  
  // Remove 0x prefix if present, Hardhat will handle it
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Validate length (should be 64 hex characters = 32 bytes)
  if (cleanedKey.length !== 64) {
    console.warn(`⚠️  PRIVATE_KEY có độ dài không đúng (${cleanedKey.length} ký tự, cần 64 ký tự hex).`);
    return [];
  }
  
  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(cleanedKey)) {
    console.warn('⚠️  PRIVATE_KEY không phải định dạng hex hợp lệ.');
    return [];
  }
  
  return [privateKey];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: getPrivateKey(),
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: getPrivateKey(),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

