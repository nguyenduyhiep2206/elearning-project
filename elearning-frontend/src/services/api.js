import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Chỉ warning nếu không phải là request đến public endpoints
      const publicEndpoints = [
        '/auth/login', 
        '/auth/register',
        '/reviews/', // Xem đánh giá là public
        '/courses', // Xem danh sách khóa học là public
      ];
      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      if (!isPublicEndpoint) {
        console.warn('⚠️ Không tìm thấy token trong localStorage cho request:', config.method, config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.error('❌ 401 Unauthorized - Token không hợp lệ');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chỉ redirect nếu không phải đang ở trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Không có quyền truy cập
      console.error('❌ 403 Forbidden - Không có quyền truy cập');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user role:', user.role);
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      console.log('Error message:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
