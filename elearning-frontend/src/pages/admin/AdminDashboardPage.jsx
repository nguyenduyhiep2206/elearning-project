import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

/**
 * AdminDashboardPage - Trang layout chính cho admin dashboard
 * Sử dụng layout 2 cột: Sidebar bên trái và Content bên phải
 */
const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar bên trái */}
        <AdminSidebar />
        
        {/* Content bên phải */}
        <div className="flex-1 ml-64">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

