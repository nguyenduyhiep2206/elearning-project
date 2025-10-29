import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import Header from './components/Header'
import Footer from './components/Footer'
import MyCoursesPage from './pages/admin/MyCoursesPage';
import AdminContentManagementPage from './pages/admin/AdminContentManagementPage';
import CourseFormPage from './pages/admin/CourseFormPage';
import ProtectedRoute from './components/routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
                  
              <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}> 
                <Route path="/admin/my-courses" element={<MyCoursesPage />} />
                <Route path="/admin/course/new" element={<CourseFormPage />} />
                <Route path="/admin/course/:id/edit" element={<CourseFormPage />} />
                <Route path="/admin/course/:id/manage" element={<AdminContentManagementPage />} />
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