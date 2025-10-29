import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Các trang chung
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'; // <-- Import mới
import LessonPlayerPage from './pages/LessonPlayerPage'; // <-- Import mới

// Các component chung
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/routes/ProtectedRoute';

// Các trang Admin/Instructor
import MyCoursesPage from './pages/admin/MyCoursesPage';
import AdminContentManagementPage from './pages/admin/AdminContentManagementPage';
import CourseFormPage from './pages/admin/CourseFormPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* === Các Route Công khai === */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/course/:id" element={<CourseDetailPage />} /> {/* <-- Route mới được thêm */}
                  
              {/* === Các Route được bảo vệ cho Instructor/Admin === */}
              <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}> 
                <Route path="/admin/my-courses" element={<MyCoursesPage />} />
                <Route path="/admin/course/new" element={<CourseFormPage />} />
                <Route path="/admin/course/:id/edit" element={<CourseFormPage />} />
                <Route path="/admin/course/:id/manage" element={<AdminContentManagementPage />} />
              </Route>

              {/* === Các Route được bảo vệ cho Student/Admin === */}
              <Route element={<ProtectedRoute roles={['student', 'admin']} />}> {/* <-- Route mới được thêm */}
                <Route path="/learn/:courseId/lesson/:lessonId" element={<LessonPlayerPage />} />
              </Route>

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App