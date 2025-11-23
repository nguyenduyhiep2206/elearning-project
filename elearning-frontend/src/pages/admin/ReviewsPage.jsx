import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services';

/**
 * ReviewsPage - Trang quản lý đánh giá
 * Route: /admin/dashboard/reviews
 */
const ReviewsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Fetch reviews
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'reviews', page, ratingFilter],
    queryFn: () => adminService.getAllReviews({ 
      page, 
      limit: 10, 
      rating: ratingFilter || undefined 
    }),
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId) => adminService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'reviews']);
      setNotification({ type: 'success', message: 'Xóa đánh giá thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi xóa đánh giá: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      deleteMutation.mutate(reviewId);
    }
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  // Parse reviews data
  const reviewsResult = reviewsData?.data?.data || reviewsData?.data || {};
  const reviews = reviewsResult.reviews || [];
  const pagination = {
    totalPages: reviewsResult.totalPages || 1,
    currentPage: reviewsResult.currentPage || 1,
    totalCount: reviewsResult.totalCount || 0,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đánh giá</h1>
        <p className="text-gray-600 mt-2">Quản lý tất cả đánh giá trong hệ thống</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo xếp hạng</label>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          {/* Total Count */}
          <div className="flex items-end">
            <div className="w-full bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Tổng số đánh giá</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Không tìm thấy đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xếp hạng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bình luận
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
                  {reviews.map((review) => {
                    const student = review.student || {};
                    const course = review.course || {};
                    
                    return (
                      <tr key={review.reviewid || review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {course.imageurl && (
                              <img
                                src={course.imageurl}
                                alt={course.coursename}
                                className="w-12 h-12 object-contain rounded-lg bg-gray-100"
                              />
                            )}
                            <div className="px-2">
                              <p className="text-sm font-medium text-gray-900">
                                {course.coursename || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {course.courseid || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullname || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{student.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating || 0)}
                            <span className="ml-2 text-sm text-gray-600">({review.rating || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">
                            {review.comment || 'Không có bình luận'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(review.createdat || review.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteReview(review.reviewid || review.id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

export default ReviewsPage;

