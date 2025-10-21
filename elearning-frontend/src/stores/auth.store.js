import { defineStore } from 'pinia'
import { authService } from '../services/auth.service.js'

// Store để quản lý trạng thái đăng nhập
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isInstructor: (state) => state.user?.role === 'Teacher',
    isStudent: (state) => state.user?.role === 'student',
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    // Khởi tạo trạng thái auth từ localStorage
    initializeAuth() {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Error parsing user data:', error)
          this.clearAuth()
        }
      }
    },

    // Hàm đăng nhập
    async login(email, password) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.login(email, password)
        
        if (result.success) {
          this.user = result.data.user
          this.token = result.data.token
          
          // Lưu vào localStorage
          localStorage.setItem('authToken', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))
          
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Hàm đăng ký
    async register(fullName, email, password) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.register(fullName, email, password)
        
        if (result.success) {
          this.user = result.data.user
          this.token = result.data.token
          
          // Lưu vào localStorage
          localStorage.setItem('authToken', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))
          
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Hàm đăng xuất
    async logout() {
      this.isLoading = true

      try {
        // Gọi API đăng xuất (tùy chọn)
        await authService.logout()
      } catch (error) {
        console.error('Logout API error:', error)
      } finally {
        // Xóa trạng thái auth bất kể kết quả của API call
        this.clearAuth()
        this.isLoading = false
      }
    },

    // Xóa dữ liệu đăng nhập
    clearAuth() {
      this.user = null
      this.token = null
      this.error = null
      
      // Xóa localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    // Cập nhật thông tin user
    async updateProfile(userData) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.updateProfile(userData)
        
        if (result.success) {
          this.user = { ...this.user, ...result.data.user }
          
          // Cập nhật localStorage
          localStorage.setItem('user', JSON.stringify(this.user))
          
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Thay đổi mật khẩu
    async changePassword(currentPassword, newPassword) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.changePassword(currentPassword, newPassword)
        
        if (result.success) {
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Kiểm tra token
    async verifyToken() {
      if (!this.token) {
        return { success: false, error: 'No token found' }
      }

      try {
        const result = await authService.verifyToken()
        
        if (result.success) {
          return { success: true }
        } else {
          this.clearAuth()
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.clearAuth()
        return { success: false, error: 'Token verification failed' }
      }
    },

    // Lấy dữ liệu user hiện tại
    async getCurrentUser() {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.getCurrentUser()
        
        if (result.success) {
          this.user = result.data.user
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'An unexpected error occurred'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Kiểm tra quyền hạn của user
    hasPermission(requiredRole) {
      if (!this.isLoggedIn) return false
      
      const roleHierarchy = {
        'student': 1,
        'Teacher': 2,
        'admin': 3
      }
      
      const userLevel = roleHierarchy[this.userRole] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0
      
      return userLevel >= requiredLevel
    },

    // Xóa lỗi
    clearError() {
      this.error = null
    },
  },
})
