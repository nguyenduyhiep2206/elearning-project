# Blockchain Service - Academic Certificate NFT

Dịch vụ blockchain cho nền tảng e-learning, sử dụng Smart Contract để phát hành chứng chỉ học thuật dưới dạng Soulbound NFT (Non-Transferable Token).

## Tính năng

- **Soulbound NFT**: Chứng chỉ không thể chuyển nhượng, gắn liền với ví của người nhận
- **ERC721URIStorage**: Hỗ trợ metadata URI cho từng chứng chỉ
- **Access Control**: Chỉ Owner (Admin nhà trường) mới có thể phát hành chứng chỉ
- **Mapping Database-Blockchain**: Liên kết CertificateID trong database với TokenID trên blockchain

## Cài đặt

```bash
npm install
```

## Compile Contract

```bash
npm run compile
```

## Deploy Contract

### Deploy lên Hardhat Network (Local)

1. Khởi động Hardhat node:
```bash
npx hardhat node
```

2. Trong terminal khác, deploy contract:
```bash
npm run deploy:local
```

## Smart Contract: AcademicCertificate.sol

### Hàm chính

#### `issueCertificate(address recipient, string memory tokenURI, uint256 certificateId)`
Phát hành chứng chỉ mới cho người nhận.

**Parameters:**
- `recipient`: Địa chỉ ví của người nhận chứng chỉ
- `tokenURI`: URI trỏ đến metadata của chứng chỉ (JSON)
- `certificateId`: ID chứng chỉ trong database

**Returns:**
- `tokenId`: TokenID được gán trên blockchain

**Access:** Chỉ Owner

#### `getTokenIdByCertificateId(uint256 certificateId)`
Lấy TokenID từ CertificateID.

#### `getCertificateIdByTokenId(uint256 tokenId)`
Lấy CertificateID từ TokenID.

#### `isCertificateIssued(uint256 certificateId)`
Kiểm tra xem chứng chỉ đã được phát hành chưa.

### Tính năng Soulbound

Contract đã override các hàm sau để ngăn chặn việc chuyển nhượng:
- `transferFrom()`
- `safeTransferFrom()`
- `safeTransferFrom()` với data

Tất cả các hàm này sẽ revert với thông báo: "AcademicCertificate: Certificates are soulbound and cannot be transferred"

## Cấu trúc thư mục

```
blockchain-service/
├── contracts/
│   └── AcademicCertificate.sol    # Smart Contract chính
├── scripts/
│   └── deploy.js                  # Script deploy contract
├── hardhat.config.js              # Cấu hình Hardhat
├── package.json
└── README.md
```

## Ví dụ sử dụng

### 1. Phát hành chứng chỉ

```javascript
const certificate = await ethers.getContractAt("AcademicCertificate", contractAddress);

// Phát hành chứng chỉ
const tx = await certificate.issueCertificate(
  recipientAddress,
  "https://example.com/metadata/1.json",
  123  // CertificateID từ database
);

await tx.wait();
```

### 2. Tra cứu TokenID từ CertificateID

```javascript
const tokenId = await certificate.getTokenIdByCertificateId(123);
console.log("Token ID:", tokenId.toString());
```

### 3. Tra cứu CertificateID từ TokenID

```javascript
const certificateId = await certificate.getCertificateIdByTokenId(tokenId);
console.log("Certificate ID:", certificateId.toString());
```

## Metadata Format

TokenURI nên trỏ đến một file JSON với format sau:

```json
{
  "name": "Academic Certificate",
  "description": "Certificate of completion for...",
  "image": "https://example.com/certificate-image.png",
  "attributes": [
    {
      "trait_type": "Course",
      "value": "Blockchain Development"
    },
    {
      "trait_type": "Grade",
      "value": "A+"
    },
    {
      "trait_type": "Issue Date",
      "value": "2024-01-01"
    }
  ]
}
```

## Lưu ý

- Contract sử dụng Solidity 0.8.24
- OpenZeppelin Contracts v5.0.0
- Token IDs bắt đầu từ 1
- Mỗi CertificateID chỉ có thể được sử dụng một lần

## License

MIT

