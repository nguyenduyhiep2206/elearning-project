import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services';

const OrdersHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await orderService.getUserOrders();
      let ordersData = response.data?.data || response.data || [];
      
      // Tự động hủy các đơn hàng Pending quá 15 phút (đã hết hạn thanh toán)
      const now = new Date();
      const expiredOrders = ordersData.filter(order => {
        if (order.status !== 'Pending') return false;
        const orderDate = new Date(order.createdat);
        const minutesDiff = (now - orderDate) / (1000 * 60);
        return minutesDiff > 15; // Quá 15 phút
      });

      // Cập nhật các đơn hàng hết hạn thành Cancelled
      for (const order of expiredOrders) {
        try {
          await orderService.cancelOrder(order.orderid);
        } catch (err) {
          console.error(`Error canceling order ${order.orderid}:`, err);
        }
      }

      // Reload danh sách sau khi cập nhật
      if (expiredOrders.length > 0) {
        const updatedResponse = await orderService.getUserOrders();
        ordersData = updatedResponse.data?.data || updatedResponse.data || [];
      }
      
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải lịch sử đơn hàng');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = async (order) => {
    // Nếu order đang Pending, hủy nó trước khi thanh toán lại
    if (order.status === 'Pending') {
      try {
        await orderService.cancelOrder(order.orderid);
        // Reload danh sách
        await fetchOrders();
      } catch (err) {
        alert('Có lỗi xảy ra khi hủy đơn hàng cũ: ' + err.message);
        return;
      }
    }
    // Chuyển đến trang giỏ hàng để thanh toán lại
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ thanh toán' },
      'Processing': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      'Failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <p className="text-lg font-medium">{error}</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mt-4">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Sử Đơn Hàng</h1>
          <p className="text-gray-600">Xem tất cả đơn hàng của bạn</p>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-receipt text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào trong lịch sử</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Khám phá khóa học
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderid} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Đơn hàng #{order.orderid}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Ngày đặt: {formatDate(order.createdat)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal-600">
                        {formatPrice(order.totalamount)}
                      </p>
                      {order.discountedamount > 0 && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(order.totalamount + order.discountedamount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderdetails && order.orderdetails.length > 0 ? (
                      order.orderdetails.map((detail, index) => (
                        <div key={detail.orderdetailid || index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          {/* Course Image */}
                          <div className="flex-shrink-0">
                            <img 
                              src={detail.course?.imageurl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=70&fit=crop'}
                              alt={detail.course?.coursename}
                              className="w-24 h-16 object-cover rounded-lg"
                            />
                          </div>
                          
                          {/* Course Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-gray-900 truncate">
                              {detail.course?.coursename || 'Khóa học'}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Giá: {formatPrice(detail.price)}
                            </p>
                          </div>

                          {/* View Course Button */}
                          {order.status === 'Completed' && detail.course?.courseid && (
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => navigate(`/courses/${detail.course.courseid}/learn`)}
                                className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                              >
                                Học ngay
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Không có chi tiết đơn hàng</p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.orderdetails?.length || 0} khóa học
                    </div>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Thanh toán lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersHistoryPage;

