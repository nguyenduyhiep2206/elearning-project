import api from './api';

/**
 * Service để xử lý các API liên quan đến authentication
 */
class AuthService {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập
   * @param {string} credentials.email - Email người dùng
   * @param {string} credentials.password - Mật khẩu người dùng
   * @returns {Promise<Object>} - Thông tin user và token
   */
  async login(credentials) {
    try {
      console.log('🌐 AuthService: Gửi request đến /auth/login với:', credentials);
      const response = await api.post('/auth/login', credentials);
      
      console.log('📥 AuthService: Nhận response từ server:', response.data);
      
      // Backend trả về format: { message, token, user }
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.data.message,
      };
    } catch (error) {
      console.log('💥 AuthService: Lỗi từ server:', error.response?.data);
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(errorMessage);
    }
  }

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Thông tin đăng ký
   * @param {string} userData.fullName - Họ tên người dùng
   * @param {string} userData.email - Email người dùng
   * @param {string} userData.password - Mật khẩu người dùng
   * @returns {Promise<Object>} - Thông tin user và token
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      return {
        success: true,
        data: {
          user: response.data.data.user,
          token: response.data.data.token,
        },
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  }

  /**
   * Đăng xuất người dùng
   * @returns {Promise<Object>} - Kết quả đăng xuất
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng xuất thất bại';
      throw new Error(errorMessage);
    }
  }

  /**
   * Xác thực token và lấy thông tin user
   * @returns {Promise<Object>} - Thông tin user
   */
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return {
        success: true,
        data: {
          user: response.data.data.user,
        },
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Token không hợp lệ';
      throw new Error(errorMessage);
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise<Object>} - Thông tin user
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: {
          user: response.data.data.user,
        },
        message: response.data.message,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể lấy thông tin user';
      throw new Error(errorMessage);
    }
  }
}

// Export instance của service
export default new AuthService();
