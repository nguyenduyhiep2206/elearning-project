import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import SignupPage from '../views/SignupPage.vue'
import Dashboard from '../views/Dashboard.vue'
import TestPage from '../views/TestPage.vue'
import CourseDetails from '../views/CourseDetails.vue'

const routes = [
  {
    path: '/', // Đường dẫn URL
    name: 'Home', // Tên của route
    component: HomePage // Component sẽ được hiển thị
  },
  {
    path: '/test',
    name: 'Test',
    component: TestPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/:id',
    name: 'CourseDetails',
    component: CourseDetails,
    props: true
  }
  // Thêm các route khác ở đây, ví dụ: /signup, /courses/:id, ...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard để bảo vệ route (tạm thời tắt để test)
// router.beforeEach((to, from, next) => {
//   try {
//     const authStore = useAuthStore()
    
//     // Khởi tạo auth state từ localStorage
//     authStore.initializeAuth()
    
//     // Nếu đã đăng nhập và cố gắng vào trang login/signup, chuyển về trang chủ
//     if (authStore.isLoggedIn && (to.name === 'Login' || to.name === 'Signup')) {
//       next({ name: 'Home' })
//       return
//     }
    
//     // Kiểm tra xem route có yêu cầu authentication không
//     if (to.meta.requiresAuth) {
//       if (!authStore.isLoggedIn) {
//         // Nếu route cần bảo vệ nhưng không có token, chuyển hướng về trang đăng nhập
//         next({ name: 'Login' })
//       } else {
//         // Có token, cho phép tiếp tục
//         next()
//       }
//     } else {
//       // Route không yêu cầu authentication, cho phép truy cập
//       next()
//     }
//   } catch (error) {
//     console.error('Router guard error:', error)
//     // Nếu có lỗi, vẫn cho phép truy cập route
//     next()
//   }
// })

export default router