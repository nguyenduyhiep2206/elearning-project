import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CartPage from './pages/CartPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import DashboardOverview from './pages/admin/DashboardOverview'
import ApprovalQueue from './pages/admin/ApprovalQueue'
import OrdersPage from './pages/admin/OrdersPage'
import ReviewsPage from './pages/admin/ReviewsPage'
import PromotionsPage from './pages/admin/PromotionsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import UsersPage from './pages/admin/UsersPage'
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage'
import TeacherOverview from './pages/teacher/TeacherOverview'
import MyCourses from './pages/teacher/MyCourses'
import MyStudents from './pages/teacher/MyStudents'
import CourseContent from './pages/teacher/CourseContent'
import CourseLearningPage from './pages/CourseLearningPage'
import QuizTakingPage from './pages/QuizTakingPage'
import QuizResultPage from './pages/QuizResultPage'
import PaymentResultPage from './pages/PaymentResultPage'
import OrdersHistoryPage from './pages/OrdersHistoryPage'
import MyCoursesPage from './pages/MyCoursesPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Messages from './pages/admin/Messages'

// Tạo QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router>
            <Routes>
          {/* Admin Dashboard - Full page layout (no Header/Footer) */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles="admin" redirectTo="/">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          >
            {/* Nested routes cho admin dashboard */}
            <Route index element={<Navigate to="/admin/dashboard/overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="messages" element={<Messages />} />
          </Route>
          {/* Redirect /admin to /admin/dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles="admin" redirectTo="/">
                <Navigate to="/admin/dashboard/overview" replace />
                  </ProtectedRoute>
                } 
              />
          
          {/* Other routes - With Header/Footer */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/courses/:id" element={<Layout><CourseDetailPage /></Layout>} />
          <Route 
            path="/courses/:id/learn" 
            element={
              <ProtectedRoute>
                <CourseLearningPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:id/learn/quiz/:quizId" 
            element={
              <ProtectedRoute>
                <QuizTakingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses/:id/learn/quiz/:quizId/result" 
            element={
              <ProtectedRoute>
                <QuizResultPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/payment/result" element={<Layout><PaymentResultPage /></Layout>} />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Layout><OrdersHistoryPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-courses" 
            element={
              <ProtectedRoute>
                <Layout><MyCoursesPage /></Layout>
              </ProtectedRoute>
            } 
          />
          {/* Teacher Dashboard - Full page layout (no Header/Footer) */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRoles="teacher" redirectTo="/">
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          >
            {/* Nested routes cho teacher dashboard */}
            <Route index element={<Navigate to="/teacher/dashboard/overview" replace />} />
            <Route path="overview" element={<TeacherOverview />} />
            <Route path="courses" element={<MyCourses />} />
            <Route path="students" element={<MyStudents />} />
            <Route path="content" element={<CourseContent />} />
          </Route>
          {/* Redirect /teacher to /teacher/dashboard */}
              <Route 
                path="/teacher" 
                element={
                  <ProtectedRoute allowedRoles="teacher" redirectTo="/">
                <Navigate to="/teacher/dashboard/overview" replace />
                  </ProtectedRoute>
                } 
              />
            </Routes>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App