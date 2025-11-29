import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Component bảo vệ route dựa trên role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con
 * @param {string|string[]} props.allowedRoles - Role(s) được phép truy cập
 * @param {string} props.redirectTo - Route redirect nếu không có quyền
 */
const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Đang loading, chờ xác thực
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Chưa đăng nhập, redirect về login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có allowedRoles, kiểm tra role
  if (allowedRoles) {
    const userRole = user.role?.toLowerCase();
    const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasPermission = allowedRolesArray.some(role => role.toLowerCase() === userRole);

    // Không có quyền, redirect
    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Có quyền hoặc không yêu cầu role cụ thể, render children
  return children;
};

export default ProtectedRoute;

