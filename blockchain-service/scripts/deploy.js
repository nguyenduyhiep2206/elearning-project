const hre = require("hardhat");

async function main() {
  console.log("🚀 Bắt đầu deploy AcademicCertificate contract...\n");

  // Lấy signer đầu tiên (deployer)
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying với account:", deployer.address);
  
  // Kiểm tra balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Lấy contract factory
  const AcademicCertificate = await hre.ethers.getContractFactory("AcademicCertificate");
  
  // Deploy contract với deployer làm admin
  console.log("⏳ Đang deploy contract...");
  const certificate = await AcademicCertificate.deploy(deployer.address);
  
  // Đợi contract được deploy
  await certificate.waitForDeployment();
  const contractAddress = await certificate.getAddress();
  
  console.log("\n✅ Deploy thành công!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", deployer.address);
  console.log("\n📋 Copy dòng sau vào file .env:");
  console.log(`CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`ADMIN_PRIVATE_KEY=<private_key_của_deployer>`);
  console.log("\n💡 Lưu ý: Private key của deployer cần được lấy từ Hardhat accounts hoặc ví của bạn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi khi deploy:", error);
    process.exit(1);
  });

