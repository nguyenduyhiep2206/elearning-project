import React from 'react';

/**
 * UsersPage - Trang quản lý người dùng
 * Route: /admin/dashboard/users
 * (Placeholder - có thể mở rộng sau)
 */
const UsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-gray-500 text-center">
          Tính năng quản lý người dùng sẽ được phát triển trong tương lai.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;

