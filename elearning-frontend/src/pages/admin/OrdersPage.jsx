import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services';

/**
 * OrdersPage - Trang quản lý đơn hàng
 * Route: /admin/dashboard/orders
 */
const OrdersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter],
    queryFn: () => adminService.getAllOrders({ page, limit: 10, status: statusFilter || undefined }),
  });

  // Fetch order details
  const { data: orderDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin', 'order', selectedOrderId],
    queryFn: () => adminService.getOrderById(selectedOrderId),
    enabled: !!selectedOrderId && isDetailModalOpen,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'orders']);
      setNotification({ type: 'success', message: 'Cập nhật trạng thái đơn hàng thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Parse orders data
  const ordersResult = ordersData?.data?.data || ordersData?.data || {};
  const orders = ordersResult.orders || [];
  const pagination = {
    totalPages: ordersResult.totalPages || 1,
    currentPage: ordersResult.currentPage || 1,
    totalCount: ordersResult.totalCount || 0,
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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-2">Quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Total Count */}
          <div className="flex items-end">
            <div className="w-full bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Tổng số đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
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
                  {orders.map((order) => {
                    const orderDetails = order.orderdetails || [];
                    const user = order.user || {};
                    
                    return (
                      <tr key={order.orderid || order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderid || order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullname || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {orderDetails.length} khóa học
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalamount || order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {order.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdat || order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(order.orderid || order.id)}
                              className="px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              Xem chi tiết
                            </button>
                            <select
                              value={order.status || ''}
                              onChange={(e) => handleStatusChange(order.orderid || order.id, e.target.value)}
                              disabled={updateStatusMutation.isPending}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none disabled:opacity-50"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
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

      {/* Order Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{selectedOrderId}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
              ) : orderDetailData?.data?.data ? (
                (() => {
                  const order = orderDetailData.data.data;
                  const user = order.user || {};
                  const orderDetails = order.orderdetails || [];
                  
                  return (
                    <div className="space-y-6">
                      {/* Customer Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Họ tên</p>
                            <p className="text-base font-medium text-gray-900">{user.fullname || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-base font-medium text-gray-900">{user.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Mã đơn hàng</p>
                            <p className="text-base font-medium text-gray-900">#{order.orderid || order.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trạng thái</p>
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                              {order.status || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ngày tạo</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatDate(order.createdat || order.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tổng tiền</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatCurrency(order.totalamount || order.totalAmount)}
                            </p>
                          </div>
                          {order.discountedamount && (
                            <div>
                              <p className="text-sm text-gray-600">Giảm giá</p>
                              <p className="text-base font-medium text-gray-900">
                                {formatCurrency(order.discountedamount || order.discountedAmount)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách khóa học</h3>
                        {orderDetails.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">Không có khóa học nào</p>
                        ) : (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khóa học
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giá
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {orderDetails.map((detail, index) => {
                                  const course = detail.course || {};
                                  return (
                                    <tr key={detail.orderdetailid || detail.id || index}>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                          {course.imageurl && (
                                            <img
                                              src={course.imageurl}
                                              alt={course.coursename}
                                              className="w-16 h-16 object-contain rounded-lg bg-gray-100"
                                            />
                                          )}
                                          <div>
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
                                        <p className="text-sm font-medium text-gray-900">
                                          {formatCurrency(detail.price)}
                                        </p>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td className="px-6 py-4 text-right font-semibold text-gray-900" colSpan={1}>
                                    Tổng cộng:
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <p className="text-lg font-bold text-gray-900">
                                      {formatCurrency(order.totalamount || order.totalAmount)}
                                    </p>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Không tìm thấy thông tin đơn hàng</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

