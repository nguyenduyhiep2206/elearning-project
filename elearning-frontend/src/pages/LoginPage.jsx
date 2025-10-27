import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component trang đăng nhập
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, loading, clearError } = useAuth();

  // State quản lý dữ liệu form
  const [email, setEmail] = useState(''); // Email người dùng
  const [password, setPassword] = useState(''); // Mật khẩu người dùng
  const [showPassword, setShowPassword] = useState(false); // Hiển thị/ẩn mật khẩu

  // Hàm chuyển đổi hiển thị mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn chặn reload trang
    
    console.log('🚀 Bắt đầu đăng nhập...');

    // Xóa lỗi trước đó
    clearError();

    try {
      console.log('📤 Gửi request đăng nhập...');
      // Gọi hàm đăng nhập từ context
      await login({ email, password });
      
      console.log('✅ Đăng nhập thành công!');
      // Chuyển hướng đến dashboard khi đăng nhập thành công
      navigate('/dashboard');
    } catch (error) {
      console.log('❌ Đăng nhập thất bại:', error.message);
      // Lỗi được xử lý bởi context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nội dung chính */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Container form đăng nhập */}
          <div className="bg-white py-8 px-6 md:shadow-lg md:border md:border-gray-200 md:rounded-lg md:px-8">
            {/* Header form */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-gray-600 text-sm">
                Nhập thông tin đăng nhập để truy cập tài khoản của bạn
              </p>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Lỗi đăng nhập:</span>
                </div>
                <p className="mt-1 ml-7">{error}</p>
              </div>
            )}

            {/* Form đăng nhập */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Trường Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@email.com"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
              </div>

              {/* Trường Mật khẩu */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                  />
                  {/* Nút hiển thị/ẩn mật khẩu */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      // Icon mắt bị gạch (ẩn mật khẩu)
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // Icon mắt mở (hiển thị mật khẩu)
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Link quên mật khẩu */}
                <div className="text-right mt-1">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              {/* Nút đăng nhập */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Đường phân cách */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            {/* Các nút đăng nhập mạng xã hội */}
            <div className="space-y-3">
              {/* Nút đăng nhập Google */}
              <button
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Tiếp tục với Google
              </button>

              {/* Nút đăng nhập Facebook */}
              <button
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Tiếp tục với Facebook
              </button>

              {/* Nút đăng nhập Apple */}
              <button
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Tiếp tục với Apple
              </button>
            </div>
          </div>

          {/* Các link footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <a href="#" className="text-blue-600 hover:text-blue-800">Đăng ký thông qua tổ chức của bạn</a>
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-800">Điều khoản sử dụng</a>
              <a href="#" className="text-blue-600 hover:text-blue-800">Chính sách</a>
              <a href="#" className="text-blue-600 hover:text-blue-800">Trợ giúp</a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Bằng cách đăng nhập, bạn đồng ý với
              <a href="#" className="text-blue-600 hover:text-blue-800">Điều khoản dịch vụ</a>
              và
              <a href="#" className="text-blue-600 hover:text-blue-800">Chính sách bảo mật</a>
              của chúng tôi.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;