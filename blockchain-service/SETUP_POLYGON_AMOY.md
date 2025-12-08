# Hướng dẫn Setup Polygon Amoy Testnet (Miễn phí - Phí cực thấp)

Polygon Amoy là testnet mới của Polygon, hoàn toàn miễn phí với **phí gas cực thấp** và **tốc độ nhanh**. Lý tưởng cho việc test NFT certificates.

## Tại sao chọn Polygon Amoy?

✅ **Phí gas cực thấp** - Gần như miễn phí (0.0001 - 0.001 MATIC)
✅ **Tốc độ nhanh** - Confirm trong 2-3 giây
✅ **Miễn phí hoàn toàn** - Dùng test MATIC
✅ **Tương thích EVM** - Giống Ethereum, code không cần thay đổi
✅ **Xem được trên Polygonscan** - https://amoy.polygonscan.com
✅ **NFT hiển thị trong Metamask** - Xem được trong extension
✅ **Không cần chạy local node** - Dùng RPC public

## Bước 1: Tạo ví và lấy Polygon Amoy MATIC (Faucet)

### 1.1. Tạo ví mới hoặc dùng ví hiện có
- Mở Metamask
- Tạo ví mới hoặc import ví (lưu private key cẩn thận)

### 1.2. Lấy Polygon Amoy MATIC từ Faucet
Bạn cần Amoy MATIC để trả phí gas khi deploy contract và mint NFT. Có thể lấy từ:

**Option 1: Polygon Faucet (Khuyên dùng)**
- Truy cập: https://faucet.polygon.technology/
- Chọn "Amoy" network
- Nhập địa chỉ ví của bạn
- Nhận 1 Amoy MATIC (đủ để test hàng trăm lần)

**Option 2: Alchemy Faucet**
- Truy cập: https://www.alchemy.com/faucets/polygon-amoy
- Cần đăng ký tài khoản Alchemy (miễn phí)
- Nhận Amoy MATIC

**Option 3: QuickNode Faucet**
- Truy cập: https://faucet.quicknode.com/polygon/amoy
- Nhận Amoy MATIC

### 1.3. Thêm Polygon Amoy Network vào Metamask
Nếu chưa có, thêm Amoy network:
- Network Name: Polygon Amoy
- RPC URL: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Currency Symbol: MATIC
- Block Explorer: https://amoy.polygonscan.com

**Hoặc tự động thêm:**
1. Truy cập: https://chainlist.org/
2. Tìm "Polygon Amoy"
3. Click "Connect Wallet" và "Add to Metamask"

## Bước 2: Lấy RPC URL (Optional - để tăng tốc độ)

### Option 1: Dùng Public RPC (Miễn phí)
```
https://rpc.ankr.com/polygon_amoy
```

### Option 2: Tạo RPC URL từ Alchemy/Infura (Khuyên dùng)
1. Đăng ký tài khoản tại https://www.alchemy.com/ hoặc https://www.infura.io/
2. Tạo project mới
3. Chọn Polygon Amoy network
4. Copy RPC URL (dạng: `https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY`)

## Bước 3: Cấu hình .env

Tạo file `.env` trong thư mục `blockchain-service`:

```env
# Polygon Amoy Network Configuration
# Option 1: Polygon Official RPC (Miễn phí - Không cần API key)
AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Option 2: Alchemy RPC (Khuyên dùng - Ổn định hơn)
# AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY

# Option 3: Infura RPC
# AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_PROJECT_ID

# Private key của ví Admin (ví có Amoy MATIC)
# LƯU Ý: KHÔNG BAO GIỜ commit private key lên Git!
# Private key phải là 64 ký tự hex (32 bytes), có thể có hoặc không có prefix 0x
# Ví dụ: PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
# hoặc: PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
PRIVATE_KEY=your_private_key_here
```

**Lưu ý quan trọng:**
- Private key phải là của ví có Amoy MATIC
- Không có prefix `0x` hoặc có đều được
- Đảm bảo ví có ít nhất 0.1 Amoy MATIC để deploy contract (1 MATIC từ faucet là quá đủ)

## Bước 4: Deploy Contract lên Polygon Amoy

```bash
cd blockchain-service
npm run deploy:amoy
```

Sau khi deploy thành công, bạn sẽ nhận được:
- Contract Address (ví dụ: `0x1234...5678`)
- Transaction Hash
- Block Number

**Copy contract address và lưu lại!**

## Bước 5: Cấu hình Backend .env

Cập nhật file `.env` trong `elearning-backend`:

```env
# Blockchain Configuration - Polygon Amoy Testnet
BLOCKCHAIN_CONTRACT_ADDRESS=0x... # Contract address từ bước 4

# Option 1: Polygon Official RPC (Miễn phí - Không cần API key)
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology

# Option 2: Alchemy RPC (Khuyên dùng - Ổn định hơn)
# BLOCKCHAIN_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY

# Option 3: Infura RPC
# BLOCKCHAIN_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_private_key_here
```

## Bước 6: Cấu hình Frontend .env

Cập nhật file `.env` trong `elearning-frontend`:

```env
VITE_BLOCKCHAIN_CONTRACT_ADDRESS=0x... # Contract address từ bước 4
VITE_API_URL=http://localhost:3000
```

**Quan trọng:** Restart frontend server sau khi sửa `.env`!

## Bước 7: Kiểm tra

1. Mở Metamask và chuyển sang Polygon Amoy network
2. Vào trang "NFT trong ví" trong ứng dụng
3. Kết nối Metamask
4. Bạn sẽ thấy NFT chứng chỉ trong ví (nếu đã mint)

## So sánh Polygon Amoy vs Sepolia

| Tính năng | Polygon Amoy | Sepolia |
|-----------|--------------|---------|
| Phí gas | ⭐⭐⭐⭐⭐ Cực thấp (~0.0001 MATIC) | ⭐⭐⭐ Trung bình (~0.001 ETH) |
| Tốc độ | ⭐⭐⭐⭐⭐ 2-3 giây | ⭐⭐⭐⭐ 12-15 giây |
| Faucet | ⭐⭐⭐⭐⭐ Dễ lấy, nhiều lựa chọn | ⭐⭐⭐ Có giới hạn |
| Explorer | ⭐⭐⭐⭐⭐ Polygonscan | ⭐⭐⭐⭐⭐ Etherscan |
| Tương thích | ⭐⭐⭐⭐⭐ EVM hoàn toàn | ⭐⭐⭐⭐⭐ EVM |
| NFT Support | ⭐⭐⭐⭐⭐ Đầy đủ | ⭐⭐⭐⭐⭐ Đầy đủ |

**Kết luận:** Polygon Amoy phù hợp hơn cho testing vì phí thấp và nhanh hơn.

## Lợi ích của Polygon Amoy Testnet

✅ **Phí cực thấp** - Gần như miễn phí
✅ **Tốc độ nhanh** - Confirm trong vài giây
✅ **Miễn phí hoàn toàn** - Dùng test MATIC
✅ **Có thể xem trên Polygonscan** - https://amoy.polygonscan.com
✅ **Giống Mainnet** - Test đầy đủ tính năng
✅ **Không cần chạy local node** - Dùng RPC public
✅ **NFT hiển thị trong Metamask** - Xem được trong extension

## Troubleshooting

### Lỗi: "insufficient funds for gas"
- Kiểm tra ví có đủ Amoy MATIC chưa
- Lấy thêm từ faucet (1 MATIC là quá đủ)

### Lỗi: "nonce too high"
- Reset nonce trong Metamask hoặc đợi một chút

### Lỗi: "network error"
- Kiểm tra RPC URL có đúng không
- Thử dùng RPC URL khác (Alchemy/Infura)

### Lỗi: "wrong network"
- Đảm bảo Metamask đang ở Polygon Amoy network (Chain ID: 80002)

## Chi phí ước tính

- Deploy contract: ~0.001 - 0.01 Amoy MATIC
- Mint 1 NFT: ~0.0001 - 0.001 Amoy MATIC
- Với 1 Amoy MATIC từ faucet, bạn có thể:
  - Deploy contract nhiều lần
  - Mint hàng nghìn NFT
  - Test đầy đủ tính năng

## Links hữu ích

- **Polygonscan Amoy**: https://amoy.polygonscan.com
- **Polygon Faucet**: https://faucet.polygon.technology/
- **Chainlist**: https://chainlist.org/ (để thêm network vào Metamask)
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://www.infura.io/

