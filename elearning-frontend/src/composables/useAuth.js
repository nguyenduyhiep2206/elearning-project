import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Global state
const user = ref(null)
const authToken = ref(null)
const isLoading = ref(false)

export function useAuth() {
  const router = useRouter()

  // Computed properties
  const isLoggedIn = computed(() => !!authToken.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isInstructor = computed(() => userRole.value === 'instructor')
  const isStudent = computed(() => userRole.value === 'student')

  // Lấy dữ liệu user từ localStorage
  const loadUserData = () => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')
    
    if (userData) {
      try {
        user.value = JSON.parse(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        user.value = null
      }
    } else {
      user.value = null
    }
    
    authToken.value = token
  }

  // Lưu dữ liệu user vào localStorage
  const saveUserData = (userData, token) => {
    user.value = userData
    authToken.value = token
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('authToken', token)
    
    // Gửi sự kiện cho các thành phần khác
    window.dispatchEvent(new CustomEvent('authStateChanged'))
  }

  // Xóa dữ liệu user
  const clearUserData = () => {
    user.value = null
    authToken.value = null
    
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    
    // Gửi sự kiện cho các thành phần khác
    window.dispatchEvent(new CustomEvent('authStateChanged'))
  }

  // Hàm đăng nhập
  const login = async (email, password) => {
    isLoading.value = true
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      saveUserData(data.user, data.token)
      return { success: true, data }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Hàm đăng ký
  const register = async (fullName, email, password) => {
    isLoading.value = true
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      saveUserData(data.user, data.token)
      return { success: true, data }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Hàm đăng xuất
  const logout = () => {
    clearUserData()
    router.push('/')
  }

  // Kiểm tra quyền hạn của user
  const hasPermission = (requiredRole) => {
    if (!isLoggedIn.value) return false
    
    const roleHierarchy = {
      'student': 1,
      'instructor': 2,
      'admin': 3
    }
    
    const userLevel = roleHierarchy[userRole.value] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0
    
    return userLevel >= requiredLevel
  }

  // Chuyển hướng dựa trên vai trò
  const redirectByRole = () => {
    if (!isLoggedIn.value) {
      router.push('/login')
      return
    }

    switch (userRole.value) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'instructor':
        router.push('/instructor/dashboard')
        break
      case 'student':
        router.push('/dashboard')
        break
      default:
        router.push('/')
    }
  }

  // Khởi tạo trạng thái auth
  onMounted(() => {
    loadUserData()
    
    // Lắng nghe sự kiện thay đổi trạng thái auth
    window.addEventListener('authStateChanged', loadUserData)
  })

  onUnmounted(() => {
    window.removeEventListener('authStateChanged', loadUserData)
  })

  return {
    // Trạng thái
    user: readonly(user),
    authToken: readonly(authToken),
    isLoading: readonly(isLoading),
    
    // Thuộc tính tính toán
    isLoggedIn,
    userRole,
    isAdmin,
    isInstructor,
    isStudent,
    
    // Hàm
    login,
    register,
    logout, // Hàm đăng xuất
    hasPermission, // Kiểm tra quyền hạn của user
    redirectByRole, // Chuyển hướng dựa trên vai trò
    loadUserData, // Lấy dữ liệu user từ localStorage
    saveUserData, // Lưu dữ liệu user vào localStorage
    clearUserData // Xóa dữ liệu user
  }
}
