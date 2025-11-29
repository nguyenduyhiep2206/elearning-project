# Hướng dẫn thêm Polygon Amoy vào Metamask

## Vấn đề
Metamask đang ở network **Hardhat Local** (Chain ID: 31337) thay vì **Polygon Amoy** (Chain ID: 80002).

## Giải pháp: Thêm Polygon Amoy Network vào Metamask

### Cách 1: Tự động thêm (Khuyên dùng)

1. Truy cập: https://chainlist.org/
2. Tìm kiếm: "Polygon Amoy"
3. Tìm network có:
   - **Name**: Polygon Amoy
   - **Chain ID**: 80002
4. Click **"Connect Wallet"** → Chọn Metamask
5. Click **"Add to Metamask"**
6. Xác nhận trong Metamask popup

### Cách 2: Thêm thủ công

1. Mở Metamask extension
2. Click vào network dropdown (hiện tại đang hiển thị "Localhost 8545" hoặc "Hardhat")
3. Click **"Add Network"** hoặc **"Add a network manually"**
4. Điền thông tin sau:

   - **Network Name**: `Polygon Amoy`
   - **New RPC URL**: `https://rpc-amoy.polygon.technology`
   - **Chain ID**: `80002`
   - **Currency Symbol**: `MATIC`
   - **Block Explorer URL** (optional): `https://amoy.polygonscan.com`

5. Click **"Save"**

### Cách 3: Thêm bằng code (Nếu cần tự động)

Bạn có thể thêm network tự động bằng JavaScript:

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com']
  }]
});
```

## Sau khi thêm network

1. Chuyển sang Polygon Amoy network trong Metamask
2. Refresh trang web (F5 hoặc Ctrl+R)
3. Kết nối lại Metamask
4. Thử lại trang "NFT trong ví"

## Kiểm tra

Sau khi chuyển network, mở Console (F12) và kiểm tra:
- Network name phải là "amoy" hoặc "Polygon Amoy"
- Chain ID phải là "80002"
- Không còn thấy "unknown (Chain ID: 31337)"

## Lưu ý

- Chain ID 31337 là Hardhat local network (chỉ dùng khi chạy local node)
- Chain ID 80002 là Polygon Amoy testnet (network công khai)
- Contract đã được deploy trên Polygon Amoy, không phải local network

