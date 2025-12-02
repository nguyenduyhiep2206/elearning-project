import api from './api';


class AuthService {

  async login(credentials) {
    try {
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


  async getCurrentUser(token = null) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get('/auth/me', { headers });
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

  googleAuthUrl(mode = "login") {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${apiUrl}/api/v1/auth/google?mode=${mode}`;
  }


  loginWithFacebook() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/api/v1/auth/facebook`;
  }
}

export default new AuthService();
