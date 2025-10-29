// src/components/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // (File này bạn đã có)

// roles: Là một mảng các vai trò được phép (ví dụ: ['instructor', 'admin'])
const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Kiểm tra đã đăng nhập chưa
  if (!isAuthenticated) {
    // Nếu chưa, điều hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu route này yêu cầu vai trò cụ thể
  if (roles && roles.length > 0) {
    // Kiểm tra xem vai trò của user có nằm trong danh sách được phép không
    if (roles.includes(user.role)) {
      // Nếu đúng, cho phép truy cập
      return <Outlet />;
    } else {
      // Nếu sai vai trò, điều hướng về trang chủ hoặc trang "Cấm"
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu đã đăng nhập và route không yêu cầu vai trò
  return <Outlet />;
};

export default ProtectedRoute;