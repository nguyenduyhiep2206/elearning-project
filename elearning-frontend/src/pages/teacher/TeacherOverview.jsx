import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services';
import StatCard from '../../components/admin/StatCard';

/**
 * TeacherOverview - Trang tổng quan cho teacher
 */
const TeacherOverview = () => {
  const navigate = useNavigate();

  // Fetch teacher stats
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['teacher', 'stats'],
    queryFn: teacherService.getStats,
  });

  // Fetch recent courses
  const { data: coursesData } = useQuery({
    queryKey: ['teacher', 'courses', 'recent'],
    queryFn: () => teacherService.getMyCourses({ page: 1, limit: 5 }),
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  const stats = statsData?.data?.data || statsData?.data || {};
  const courses = coursesData?.data?.data?.courses || coursesData?.data?.courses || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600 mt-2">Thống kê về khóa học của bạn</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng khóa học"
          value={stats.totalCourses || 0}
          icon="📚"
          color="bg-blue-500"
        />
        <StatCard
          title="Khóa học đã duyệt"
          value={stats.approvedCourses || 0}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Khóa học chờ duyệt"
          value={stats.pendingCourses || 0}
          icon="⏳"
          color="bg-yellow-500"
        />
        <StatCard
          title="Tổng học viên"
          value={stats.totalStudents || 0}
          icon="👥"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Khóa học gần đây</h2>
          <button
            onClick={() => navigate('/teacher/dashboard/courses')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {courses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Bạn chưa có khóa học nào</p>
              <button
                onClick={() => navigate('/teacher/dashboard/courses')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quản lý khóa học
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.courseid || course.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {course.imageurl && (
                    <img
                      src={course.imageurl}
                      alt={course.coursename}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-100"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{course.coursename}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.status === 'Approved' ? 'Đã duyệt' : course.status === 'Pending' ? 'Chờ duyệt' : course.status}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/teacher/dashboard/courses')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;

