# Hướng dẫn kết nối Backend và Frontend - Chức năng Đăng nhập

## Tổng quan
Dự án đã được cấu hình để kết nối frontend React với backend Node.js/Express để thực hiện chức năng đăng nhập.

## Cấu trúc đã được thiết lập

### Backend (elearning-backend)
- **API Endpoints**: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/logout`, `/api/v1/auth/verify`
- **Authentication**: JWT token với bcrypt cho mật khẩu
- **Database**: PostgreSQL với Sequelize ORM
- **Port**: 3000

### Frontend (elearning-frontend)
- **Framework**: React với Vite
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios với interceptors
- **Port**: 5173 (Vite dev server)

## Các file đã được tạo/cập nhật

### 1. AuthService (`src/services/auth.service.js`)
```javascript
// Service để gọi API authentication
- login(credentials)
- register(userData)
- logout()
- verifyToken()
- getCurrentUser()
```

### 2. AuthContext (`src/context/AuthContext.jsx`)
```javascript
// Context quản lý trạng thái authentication
- State: user, token, isAuthenticated, loading, error
- Actions: login, logout, clearError
- Auto token verification on app start
```

### 3. API Configuration (`src/services/api.js`)
```javascript
// Axios instance với interceptors
- Base URL: http://localhost:3000/api/v1
- Auto token injection
- Error handling (401 redirect to login)
```

### 4. Test Page (`src/pages/TestLogin.jsx`)
```javascript
// Trang test API authentication
- Test login functionality
- Test register functionality
- Display results
```

## Cách sử dụng

### 1. Khởi động Backend
```bash
cd elearning-backend
npm start
# Server sẽ chạy tại http://localhost:3000
```

### 2. Khởi động Frontend
```bash
cd elearning-frontend
npm run dev
# Frontend sẽ chạy tại http://localhost:5173
```

### 3. Test chức năng
1. Truy cập `http://localhost:5173/test` để test API
2. Truy cập `http://localhost:5173/login` để sử dụng trang đăng nhập thực tế

## API Response Format

### Login Success
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  }
}
```

### Login Error
```json
{
  "success": false,
  "message": "Sai email hoặc mật khẩu.",
  "data": null
}
```

## Cách sử dụng trong component

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { login, logout, user, isAuthenticated, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // Đăng nhập thành công
    } catch (error) {
      // Xử lý lỗi
      console.error(error.message);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Xin chào, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Đăng nhập</button>
      )}
    </div>
  );
};
```

## Lưu ý quan trọng

1. **CORS**: Backend đã cấu hình CORS để cho phép frontend (localhost:5173)
2. **Token Storage**: Token được lưu trong localStorage
3. **Auto Redirect**: Khi token hết hạn, user sẽ được redirect về trang login
4. **Error Handling**: Tất cả lỗi API đều được xử lý và hiển thị thông báo phù hợp

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend có đang chạy không (port 3000)
- Kiểm tra CORS configuration
- Kiểm tra network tab trong DevTools

### Lỗi authentication
- Kiểm tra token có hợp lệ không
- Kiểm tra database connection
- Kiểm tra JWT secret key

### Lỗi frontend
- Kiểm tra console errors
- Kiểm tra AuthContext có được wrap đúng không
- Kiểm tra dependencies đã cài đặt chưa
