import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../../services';

/**
 * MyStudents - Trang quản lý học viên của teacher
 */
const MyStudents = () => {
  const [page, setPage] = useState(1);
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');

  // Fetch students
  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['teacher', 'students', page, courseFilter, search],
    queryFn: () => teacherService.getStudents({ 
      page, 
      limit: 10, 
      courseId: courseFilter || undefined,
      search: search || undefined,
    }),
  });

  // Fetch courses for filter
  const { data: coursesData } = useQuery({
    queryKey: ['teacher', 'courses'],
    queryFn: () => teacherService.getMyCourses({ page: 1, limit: 100 }),
  });

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

  // Parse students data
  const studentsResult = studentsData?.data?.data || studentsData?.data || {};
  const students = studentsResult.students || [];
  const pagination = {
    totalPages: studentsResult.totalPages || 1,
    currentPage: studentsResult.currentPage || 1,
    totalCount: studentsResult.totalCount || 0,
  };

  const courses = coursesData?.data?.data?.courses || coursesData?.data?.courses || [];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý học viên</h1>
        <p className="text-gray-600 mt-2">Xem danh sách học viên đã đăng ký khóa học của bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm học viên</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tên hoặc email học viên..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo khóa học</label>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.courseid || course.id} value={course.courseid || course.id}>
                  {course.coursename}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Tổng số học viên</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Chưa có học viên nào đăng ký khóa học của bạn</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng ký
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={`${student.userId}-${student.courseId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {student.profilePicture ? (
                            <img
                              src={student.profilePicture}
                              alt={student.fullname}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {student.fullname?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.fullname}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {student.courseImage && (
                            <img
                              src={student.courseImage}
                              alt={student.courseName}
                              className="w-12 h-12 object-contain rounded-lg bg-gray-100"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.courseName}</p>
                            <p className="text-xs text-gray-500">ID: {student.courseId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(student.enrolledAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyStudents;

