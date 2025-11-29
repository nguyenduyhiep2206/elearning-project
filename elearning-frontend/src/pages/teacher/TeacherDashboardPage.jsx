import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';

/**
 * TeacherDashboardPage - Trang layout chính cho teacher dashboard
 */
const TeacherDashboardPage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('⚠️ Không tìm thấy token, redirect về login');
        navigate('/login', { replace: true });
        return;
      }

      if (!isAuthenticated || !user) {
        console.warn('⚠️ Chưa đăng nhập, redirect về login');
        navigate('/login', { replace: true });
        return;
      }

      const userRole = user.role?.toLowerCase();
      if (userRole !== 'teacher') {
        console.warn('⚠️ User không có quyền teacher, role hiện tại:', userRole);
        navigate('/', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role?.toLowerCase() !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <TeacherSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;

