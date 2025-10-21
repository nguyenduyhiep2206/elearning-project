import api from './axios.js'

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại',
      }
    }
  },

  // Register user
  async register(fullName, email, password) {
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
      }
    }
  },

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout')
      return { success: true }
    } catch (error) {
      // Even if logout fails on server, we should clear local data
      return { success: true }
    }
  },

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Xác thực token thất bại',
      }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lấy dữ liệu user thất bại',
      }
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Cập nhật profile thất bại',
      }
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đổi mật khẩu thất bại',
      }
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đặt lại mật khẩu thất bại',
      }
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || ' Đặt lại mật khẩu thất bại',
      }
    }
  },
}
