# Hướng dẫn cấu hình Blockchain cho Certificate Service

## 1. Cài đặt dependencies

Đã cài đặt `ethers.js` để tương tác với smart contract.

## 2. Cấu hình biến môi trường

Thêm các biến sau vào file `.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545  # RPC URL của blockchain network (ví dụ: Sepolia, Mumbai, hoặc local node)
CERTIFICATE_CONTRACT_ADDRESS=0x...  # Địa chỉ smart contract sau khi deploy
ADMIN_PRIVATE_KEY=0x...  # Private key của ví admin (KHÔNG chia sẻ, chỉ dùng cho backend)

# Certificate Metadata
CERTIFICATE_IMAGE_URL=https://via.placeholder.com/800x600?text=Certificate  # URL ảnh mặc định cho certificate
BACKEND_URL=http://localhost:3000  # URL backend để tạo metadata URL
FRONTEND_URL=http://localhost:5173  # URL frontend
```

### Lưu ý bảo mật:
- **KHÔNG** commit file `.env` vào git
- **KHÔNG** chia sẻ `ADMIN_PRIVATE_KEY` với bất kỳ ai
- Sử dụng ví riêng biệt cho production và development
- Cân nhắc sử dụng hardware wallet hoặc vault service cho production

## 3. Deploy Smart Contract

1. Compile contract:
```bash
cd blockchain-service
npx hardhat compile
```

2. Deploy contract (ví dụ với Hardhat network):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy địa chỉ contract và thêm vào `.env`:
```env
CERTIFICATE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## 4. Cấu hình Network

### Local Development (Hardhat):
```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
```

### Testnet (Sepolia):
```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### Mainnet (Ethereum):
```env
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

## 5. API Endpoints

### POST /api/v1/certificates/issue
Issue certificate cho sinh viên (chỉ Admin).

**Request Body:**
```json
{
  "courseId": 1,
  "studentId": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chứng chỉ đã được cấp và mint lên blockchain thành công",
  "data": {
    "certificateid": 1,
    "studentid": 1,
    "courseid": 1,
    "tokenid": 1,
    "transactionhash": "0x...",
    "metadatauri": "http://localhost:3000/certificates/certificate-1.json",
    "isminted": true,
    "walletaddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

### GET /api/v1/certificates/student/:studentId
Lấy danh sách certificates của sinh viên.

### GET /api/v1/certificates/:certificateId
Lấy thông tin chi tiết certificate.

## 6. Kiểm tra kết nối

Service sẽ tự động kiểm tra kết nối khi khởi động. Nếu có lỗi, kiểm tra:
- RPC URL có đúng không
- Contract address có đúng không
- Private key có đúng format không (phải bắt đầu bằng 0x)
- Network có đang chạy không

## 7. Metadata Files

Metadata JSON được lưu tại: `elearning-backend/public/certificates/`

Files có thể truy cập qua: `http://localhost:3000/certificates/certificate-{id}.json`

Trong production, nên upload metadata lên IPFS hoặc CDN.

## 8. Troubleshooting

### Lỗi "Contract ABI không tìm thấy"
- Đảm bảo đã compile contract: `cd blockchain-service && npx hardhat compile`
- Kiểm tra đường dẫn đến file ABI trong `blockchainService.js`

### Lỗi "Transaction failed"
- Kiểm tra ví admin có đủ gas không
- Kiểm tra network có đang chạy không
- Kiểm tra contract address có đúng không

### Lỗi "Địa chỉ ví không hợp lệ"
- Đảm bảo địa chỉ ví bắt đầu bằng `0x` và có đúng 42 ký tự
- Sử dụng checksum address nếu cần

