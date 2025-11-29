import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services';

/**
 * PromotionsPage - Trang quản lý mã giảm giá
 * Route: /admin/dashboard/promotions
 */
const PromotionsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
  });

  // Fetch promotions
  const { data: promotionsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'promotions', page],
    queryFn: () => adminService.getAllPromotions({ page, limit: 10 }),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingPromotion) {
        return adminService.updatePromotion(editingPromotion.promotionid || editingPromotion.id, data);
      }
      return adminService.createPromotion(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'promotions']);
      setIsModalOpen(false);
      setEditingPromotion(null);
      resetForm();
      setNotification({ 
        type: 'success', 
        message: editingPromotion ? 'Cập nhật mã giảm giá thành công!' : 'Tạo mã giảm giá thành công!'
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (promotionId) => adminService.deletePromotion(promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'promotions']);
      setNotification({ type: 'success', message: 'Xóa mã giảm giá thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi xóa mã giảm giá: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleOpenModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        code: promotion.code || '',
        discountPercentage: promotion.discountpercentage || promotion.discountPercentage || '',
        startDate: promotion.startdate ? new Date(promotion.startdate).toISOString().split('T')[0] : '',
        endDate: promotion.enddate ? new Date(promotion.enddate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingPromotion(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      code: formData.code,
      discountPercentage: parseInt(formData.discountPercentage),
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  };

  const handleDelete = (promotionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      deleteMutation.mutate(promotionId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isActive = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  // Parse promotions data
  const promotionsResult = promotionsData?.data?.data || promotionsData?.data || {};
  const promotions = promotionsResult.promotions || [];
  const pagination = {
    totalPages: promotionsResult.totalPages || 1,
    currentPage: promotionsResult.currentPage || 1,
    totalCount: promotionsResult.totalCount || 0,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả mã giảm giá trong hệ thống</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          + Thêm mã giảm giá
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Tổng số mã giảm giá</p>
            <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {promotions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Không tìm thấy mã giảm giá nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày kết thúc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotions.map((promotion) => {
                    const expired = isExpired(promotion.enddate || promotion.endDate);
                    const active = isActive(promotion.startdate || promotion.startDate, promotion.enddate || promotion.endDate);
                    
                    return (
                      <tr key={promotion.promotionid || promotion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.code || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.discountpercentage || promotion.discountPercentage || 0}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(promotion.startdate || promotion.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(promotion.enddate || promotion.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expired ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Hết hạn
                            </span>
                          ) : active ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Chưa bắt đầu
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenModal(promotion)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(promotion.promotionid || promotion.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Xóa
                            </button>
                          </div>
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPromotion ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="VD: SALE2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phần trăm giảm giá (%) *
                </label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  required
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="VD: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? 'Đang xử lý...' : editingPromotion ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;

