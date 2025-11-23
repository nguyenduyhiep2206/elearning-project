import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services';

/**
 * ApprovalQueue - Trang duyệt khóa học chờ phê duyệt
 * Route: /admin/dashboard/approvals
 */
const ApprovalQueue = () => {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Fetch pending courses
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['admin', 'pendingCourses'],
    queryFn: adminService.fetchPendingCourses,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (courseId) => adminService.approveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingCourses']);
      setIsDetailModalOpen(false);
      setSelectedCourse(null);
      setNotification({ type: 'success', message: 'Đã duyệt khóa học thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi duyệt khóa học: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (courseId) => adminService.rejectCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'pendingCourses']);
      setIsDetailModalOpen(false);
      setSelectedCourse(null);
      setNotification({ type: 'success', message: 'Đã từ chối khóa học thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi từ chối khóa học: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const handleApprove = (courseId) => {
    approveMutation.mutate(courseId);
  };

  const handleReject = (courseId) => {
    rejectMutation.mutate(courseId);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCourse(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  const courses = coursesData?.data?.data || coursesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.message && (
        <div
          className={`rounded-lg p-4 shadow-md ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Duyệt khóa học</h1>
          <p className="text-gray-600 mt-2">Danh sách khóa học chờ phê duyệt</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{courses.length}</span> khóa học chờ duyệt
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium">Không có khóa học nào chờ duyệt</p>
            <p className="mt-2 text-sm">Tất cả khóa học đã được xử lý</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảng viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id || course.courseId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {course.imageurl && (
                          <img
                            src={course.imageurl}
                            alt={course.title || course.courseName}
                            className="w-16 h-16 object-contain rounded-lg bg-gray-100"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.title || course.courseName || 'N/A'}
                          </div>
                          {course.description && (
                            <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.teacherName || course.instructorName || 'N/A'}
                      </div>
                      {course.teacherEmail && (
                        <div className="text-xs text-gray-500">{course.teacherEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(course.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(course.createdAt || course.createdDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleApprove(course.id || course.courseId)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(course.id || course.courseId)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {isDetailModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết khóa học</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Course Image */}
              {selectedCourse.imageurl && (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={selectedCourse.imageurl}
                    alt={selectedCourse.title || selectedCourse.courseName}
                    className="max-w-full max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Course Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên khóa học</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedCourse.title || selectedCourse.courseName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatCurrency(selectedCourse.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giảng viên</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedCourse.teacherName || selectedCourse.instructorName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(selectedCourse.createdAt || selectedCourse.createdDate)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedCourse.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedCourse.id || selectedCourse.courseId)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {approveMutation.isPending ? 'Đang xử lý...' : 'Duyệt khóa học'}
                </button>
                <button
                  onClick={() => handleReject(selectedCourse.id || selectedCourse.courseId)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {rejectMutation.isPending ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;

