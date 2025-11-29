# Blockchain Service Setup Guide

Hướng dẫn thiết lập và sử dụng Blockchain Service để phát hành chứng chỉ học thuật.

## Chọn Môi Trường

### Option 1: Local Network (Hardhat) - Phát triển
- ✅ Miễn phí, không cần ETH
- ✅ Nhanh, không cần đợi confirm
- ❌ Chỉ tồn tại khi Hardhat node đang chạy
- ❌ Không xem được trên Etherscan
- 📖 Xem hướng dẫn bên dưới

### Option 2: Polygon Amoy Testnet - Test thực tế (⭐ Khuyên dùng nhất)
- ✅ Miễn phí (dùng test MATIC)
- ✅ **Phí cực thấp** - Gần như miễn phí
- ✅ **Tốc độ nhanh** - Confirm trong 2-3 giây
- ✅ Xem được trên Polygonscan
- ✅ NFT hiển thị trong Metamask
- ✅ Tương thích hoàn toàn với Ethereum (cùng EVM)
- 📖 Xem file `SETUP_POLYGON_AMOY.md` trong thư mục `blockchain-service`

### Option 3: Sepolia Testnet - Test thực tế
- ✅ Miễn phí (dùng test ETH)
- ✅ Xem được trên Etherscan
- ✅ NFT hiển thị trong Metamask
- ✅ Giống Mainnet, test đầy đủ tính năng
- ⚠️ Phí gas cao hơn Polygon Amoy
- 📖 Xem file `SETUP_SEPOLIA.md` trong thư mục `blockchain-service`

## Yêu cầu

1. Hardhat node đang chạy (nếu dùng local) HOẶC Sepolia RPC URL (nếu dùng testnet)
2. Smart Contract `AcademicCertificate` đã được deploy
3. Private key của Admin wallet (có ETH/Test ETH)
4. Các biến môi trường đã được cấu hình

## Cấu hình Biến Môi Trường

Thêm các biến sau vào file `.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_CONTRACT_ADDRESS=0x... # Địa chỉ của Smart Contract AcademicCertificate
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545 # URL của RPC node (mặc định: localhost)
BLOCKCHAIN_ADMIN_PRIVATE_KEY=0x... # Private key của ví Admin (không có 0x prefix cũng được)

# Backend URL (để tạo metadata URL)
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

## Deploy Smart Contract

1. Di chuyển đến thư mục `blockchain-service`:
```bash
cd blockchain-service
```

2. Khởi động Hardhat node (terminal 1):
```bash
npx hardhat node
```

3. Deploy contract (terminal 2):
```bash
npm run deploy:local
```

4. Copy địa chỉ contract được in ra và thêm vào `.env`:
```
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## API Endpoints

### POST /api/v1/certificates/issue

Phát hành chứng chỉ cho sinh viên.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "courseId": 1,
  "studentId": 123,
  "studentWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificateId": 1,
    "transactionHash": "0x...",
    "tokenId": 1,
    "metadataUrl": "http://localhost:3000/metadata/certificate-1.json"
  }
}
```

**Lưu ý:**
- Chỉ Admin mới có thể gọi API này
- Sinh viên phải đã hoàn thành khóa học (có record trong bảng `coursecompletions`)
- `studentWalletAddress` phải là địa chỉ ví hợp lệ (42 ký tự, bắt đầu bằng 0x)

### GET /api/v1/certificates/student/:studentId

Lấy danh sách certificates của sinh viên.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Certificates retrieved successfully",
  "data": [
    {
      "certificateid": 1,
      "studentid": 123,
      "courseid": 1,
      "issuedat": "2024-01-01T00:00:00.000Z",
      "transactionhash": "0x...",
      "tokenid": 1,
      "course": {
        "courseid": 1,
        "coursename": "Blockchain Development",
        "description": "...",
        "thumbnail": "..."
      }
    }
  ]
}
```

### GET /api/v1/certificates/:certificateId

Lấy thông tin chi tiết của certificate.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate retrieved successfully",
  "data": {
    "certificateid": 1,
    "studentid": 123,
    "courseid": 1,
    "issuedat": "2024-01-01T00:00:00.000Z",
    "transactionhash": "0x...",
    "tokenid": 1,
    "student": {
      "userid": 123,
      "fullname": "John Doe",
      "email": "john@example.com"
    },
    "course": {
      "courseid": 1,
      "coursename": "Blockchain Development",
      "description": "...",
      "thumbnail": "..."
    }
  }
}
```

## Metadata Format

Metadata được lưu tại `public/metadata/certificate-{id}.json` với format:

```json
{
  "name": "Academic Certificate - Blockchain Development",
  "description": "This certificate is awarded to John Doe for successfully completing the course \"Blockchain Development\"",
  "image": "https://example.com/certificate-image.png",
  "attributes": [
    {
      "trait_type": "Student Name",
      "value": "John Doe"
    },
    {
      "trait_type": "Student Email",
      "value": "john@example.com"
    },
    {
      "trait_type": "Course Name",
      "value": "Blockchain Development"
    },
    {
      "trait_type": "Course ID",
      "value": "1"
    },
    {
      "trait_type": "Certificate ID",
      "value": "1"
    },
    {
      "trait_type": "Issue Date",
      "value": "2024-01-01T00:00:00.000Z"
    }
  ],
  "external_url": "http://localhost:5173/certificates/1"
}
```

## Database Schema

Bảng `certificates` cần có các trường sau:

- `certificateid` (INTEGER, PRIMARY KEY)
- `studentid` (INTEGER, FOREIGN KEY -> users.userid)
- `courseid` (INTEGER, FOREIGN KEY -> courses.courseid)
- `issuedat` (DATE)
- `transactionhash` (VARCHAR(255), NULLABLE) - Hash của transaction trên blockchain
- `tokenid` (INTEGER, NULLABLE) - Token ID trên blockchain

## Troubleshooting

### Lỗi: "BLOCKCHAIN_ADMIN_PRIVATE_KEY is required"
- Kiểm tra file `.env` có biến `BLOCKCHAIN_ADMIN_PRIVATE_KEY`
- Đảm bảo private key hợp lệ (có thể có hoặc không có prefix 0x)

### Lỗi: "Insufficient funds to pay for gas"
- Đảm bảo ví Admin có đủ ETH/token để trả phí gas
- Nếu dùng Hardhat local node, có thể dùng các account có sẵn với balance lớn

### Lỗi: "Network error"
- Kiểm tra `BLOCKCHAIN_RPC_URL` có đúng không
- Đảm bảo Hardhat node hoặc RPC node đang chạy
- Kiểm tra kết nối mạng

### Lỗi: "Student has not completed the course yet"
- Kiểm tra bảng `coursecompletions` có record với `studentid` và `courseid` tương ứng
- Đảm bảo sinh viên đã hoàn thành tất cả bài học và quiz

## Testing

1. Đảm bảo Hardhat node đang chạy
2. Deploy contract và lấy contract address
3. Cấu hình `.env` với đúng thông tin
4. Tạo một course completion record trong database
5. Gọi API `/api/v1/certificates/issue` với thông tin hợp lệ

## Security Notes

- **KHÔNG BAO GIỜ** commit file `.env` lên Git
- Private key phải được bảo mật tuyệt đối
- Chỉ Admin mới có thể phát hành certificates
- Validate tất cả input từ client
- Sử dụng HTTPS trong production

