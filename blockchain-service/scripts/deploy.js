const hre = require("hardhat");

async function main() {
  console.log("Deploying AcademicCertificate contract...");
  console.log("Network:", hre.network.name);

  // Kiểm tra private key
  if (!process.env.PRIVATE_KEY) {
    throw new Error(
      "❌ PRIVATE_KEY không được tìm thấy trong file .env!\n" +
      "Vui lòng:\n" +
      "1. Tạo file .env trong thư mục blockchain-service\n" +
      "2. Thêm dòng: PRIVATE_KEY=your_private_key_here\n" +
      "3. Đảm bảo ví có đủ MATIC/ETH để deploy"
    );
  }

  // Kiểm tra signers
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "❌ Không tìm thấy signer!\n" +
      "Vui lòng kiểm tra:\n" +
      "1. PRIVATE_KEY trong .env có đúng không\n" +
      "2. RPC URL có đúng không\n" +
      "3. Ví có đủ MATIC/ETH để deploy"
    );
  }

  console.log("Deployer address:", signers[0].address);
  
  // Kiểm tra balance
  const balance = await hre.ethers.provider.getBalance(signers[0].address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC/ETH");

  // Get the contract factory
  const AcademicCertificate = await hre.ethers.getContractFactory("AcademicCertificate");

  // Deploy the contract
  const certificate = await AcademicCertificate.deploy(
    "Academic Certificate",  // Name
    "ACERT"                  // Symbol
  );

  // Wait for deployment
  await certificate.waitForDeployment();

  const address = await certificate.getAddress();
  console.log("AcademicCertificate deployed to:", address);
  console.log("Contract owner:", await certificate.owner());

  // Save deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", address);
  console.log("Network:", hre.network.name);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

