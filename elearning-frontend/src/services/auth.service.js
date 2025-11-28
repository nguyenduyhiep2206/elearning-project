import api from './api';


class AuthService {

  async login(credentials) {
    try {
      console.log('🌐 AuthService: POST /auth/login', credentials);
      const res = await api.post('/auth/login', credentials);
      return {
        success: true,
        data: {
          user: res.data.data?.user || res.data.user,
          token: res.data.data?.token || res.data.token,
        },
        message: res.data.message,
      };
    } catch (error) {
      console.error('💥 AuthService: Lỗi đăng nhập:', error.response?.data);
      const msg = error.response?.data?.message || 'Đăng nhập thất bại';
      throw new Error(msg);
    }
  }

 
  async register(userData) {
    try {
      const res = await api.post('/auth/register', userData);
      return {
        success: true,
        data: {
          user: res.data.data?.user || res.data.user,
          token: res.data.data?.token || res.data.token,
        },
        message: res.data.message,
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(msg);
    }
  }

 
  async logout() {
    try {
      const res = await api.post('/auth/logout');
      return { success: true, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng xuất thất bại';
      throw new Error(msg);
    }
  }

  
  async verifyToken() {
    try {
      const res = await api.get('/auth/verify');
      return {
        success: true,
        data: { user: res.data.data?.user || res.data.user },
        message: res.data.message,
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Token không hợp lệ';
      throw new Error(msg);
    }
  }


  async getCurrentUser() {
    try {
      const res = await api.get('/auth/me');
      return {
        success: true,
        data: { user: res.data.data?.user || res.data.user },
        message: res.data.message,
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể lấy thông tin user';
      throw new Error(msg);
    }
  }

 googleAuthUrl = (mode = "login") => {
   `${import.meta.env.VITE_API_URL}/auth/google?mode=${mode}`;
};


  loginWithFacebook() {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/facebook`;
  }
}

export default new AuthService();
