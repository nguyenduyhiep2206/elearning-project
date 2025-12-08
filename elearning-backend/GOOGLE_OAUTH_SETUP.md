# Hướng dẫn cấu hình Google OAuth

## Lỗi: redirect_uri_mismatch

Lỗi này xảy ra khi callback URL trong code không khớp với callback URL đã đăng ký trong Google Cloud Console.

## Các bước cấu hình:

### 1. Tạo OAuth 2.0 Client ID trong Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Chọn hoặc tạo một project
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Điền thông tin:
   - **Name**: E-Learning App (hoặc tên bạn muốn)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (cho development)
     - `http://localhost:5173` (cho frontend nếu cần)
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/v1/auth/google/callback` (cho development)
     - Nếu deploy production, thêm: `https://yourdomain.com/api/v1/auth/google/callback`

7. Click **Create**
8. Copy **Client ID** và **Client Secret**

### 2. Cấu hình file .env trong backend

Tạo hoặc cập nhật file `.env` trong thư mục `elearning-backend`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-secret-key-here

# Database (nếu chưa có)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=elearning
# DB_USER=postgres
# DB_PASSWORD=your-password
```

### 3. Lưu ý quan trọng:

- **Callback URL phải khớp chính xác** (bao gồm cả `http://` hoặc `https://`, port, và path)
- Không có dấu `/` ở cuối URL
- Nếu thay đổi port backend, phải cập nhật cả trong Google Console và file .env
- Sau khi thay đổi trong Google Console, có thể mất vài phút để có hiệu lực

### 4. Kiểm tra:

1. Đảm bảo backend đang chạy trên port 3000 (hoặc port bạn đã cấu hình)
2. Kiểm tra file `.env` có đúng các biến môi trường
3. Restart backend server sau khi thay đổi `.env`
4. Thử đăng nhập lại bằng Google

### 5. Troubleshooting:

- **Lỗi vẫn còn**: Kiểm tra lại callback URL trong Google Console có khớp 100% không
- **Lỗi "redirect_uri_mismatch"**: Đảm bảo URL trong Google Console và `.env` giống hệt nhau
- **Lỗi "invalid_client"**: Kiểm tra Client ID và Client Secret có đúng không

