import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import StatCard from '../../components/admin/StatCard';

/**
 * DashboardOverview - Trang tổng quan với các thống kê
 * Route: /admin/dashboard/overview
 */
const DashboardOverview = () => {
  const navigate = useNavigate();

  // Fetch dashboard stats
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats', 'overview'],
    queryFn: adminService.fetchDashboardStats,
  });

  // Fetch recent orders
  const { data: recentOrdersData } = useQuery({
    queryKey: ['admin', 'recentOrders'],
    queryFn: () => adminService.getAllOrders({ page: 1, limit: 5 }),
  });

  // Fetch pending courses
  const { data: pendingCoursesData } = useQuery({
    queryKey: ['admin', 'pendingCourses'],
    queryFn: adminService.fetchPendingCourses,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Lỗi khi tải dữ liệu: {error.message}</p>
      </div>
    );
  }

  // Parse stats data
  const stats = statsData?.data?.data || statsData?.data || {};
  
  // Parse recent orders
  const recentOrdersResult = recentOrdersData?.data?.data || recentOrdersData?.data || {};
  const recentOrders = recentOrdersResult.orders || [];

  // Parse pending courses
  const pendingCourses = pendingCoursesData?.data?.data || pendingCoursesData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600 mt-2">Thống kê tổng quan về hệ thống</p>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Doanh thu"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon="💰"
          color="bg-teal-500"
        />
        <StatCard
          title="Tổng Học viên"
          value={stats.totalStudents || 0}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Tổng Khóa học"
          value={stats.totalCourses || 0}
          icon="📚"
          color="bg-purple-500"
        />
        <StatCard
          title="Tổng Đơn hàng"
          value={stats.totalOrders || 0}
          icon="🛒"
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Đánh giá"
          value={stats.totalReviews || 0}
          icon="⭐"
          color="bg-yellow-500"
        />
        <StatCard
          title="Mã giảm giá"
          value={stats.totalPromotions || 0}
          icon="🎫"
          color="bg-pink-500"
        />
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue || 0)}
          icon="📈"
          color="bg-green-500"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={stats.todayOrders || 0}
          icon="📦"
          color="bg-indigo-500"
        />
      </div>

      {/* Pending Courses Alert */}
      {stats.pendingCourses > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-semibold">
                  Có {stats.pendingCourses} khóa học đang chờ duyệt
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Vui lòng kiểm tra và duyệt các khóa học mới
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard/approvals')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Xem ngay
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders and Pending Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
            <button
              onClick={() => navigate('/admin/dashboard/orders')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>Chưa có đơn hàng nào</p>
              </div>
            ) : (
              recentOrders.slice(0, 5).map((order) => {
                const user = order.user || {};
                return (
                  <div key={order.orderid || order.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Đơn hàng #{order.orderid || order.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.fullname || 'N/A'} • {formatDate(order.createdat || order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalamount || order.totalAmount)}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Courses */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Khóa học chờ duyệt</h2>
            <button
              onClick={() => navigate('/admin/dashboard/approvals')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingCourses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>Không có khóa học nào chờ duyệt</p>
              </div>
            ) : (
              pendingCourses.slice(0, 5).map((course) => (
                <div key={course.id || course.courseId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {course.imageurl && (
                      <img
                        src={course.imageurl}
                        alt={course.title || course.courseName}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.title || course.courseName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.teacherName || course.instructorName || 'N/A'} • {formatDate(course.createdAt || course.createdDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

