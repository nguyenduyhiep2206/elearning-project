import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService, vnpayService } from '../services';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchCartItems();
  }, [isAuthenticated, navigate]);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await cartService.getCart();
      const items = response.data?.data || response.data || [];
      setCartItems(items);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải giỏ hàng');
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (courseId) => {
    try {
      setIsRemoving(true);
      await cartService.removeFromCart(courseId);
      
      // Cập nhật danh sách giỏ hàng
      setCartItems(prev => prev.filter(item => item.courseid !== courseId));
      
      alert('Đã xóa khóa học khỏi giỏ hàng!');
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa khóa học khỏi giỏ hàng');
      console.error('Error removing item:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCheckout = async (promotionCode = null) => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Gọi API tạo URL thanh toán (backend sẽ tự động tạo order từ cart)
      // Chỉ gửi promotionCode nếu có, không gửi event object
      const requestData = promotionCode ? { promotionCode } : {};
      const response = await vnpayService.createPaymentUrl(requestData);
      
      if (response.data?.paymentUrl) {
        // Chuyển hướng trực tiếp đến trang VNPAY
        vnpayService.redirectToPayment(response.data.paymentUrl);
      } else if (response.data?.isFree) {
        // Khóa học miễn phí - đăng ký thành công
        alert(response.message || 'Đăng ký khóa học miễn phí thành công!');
        // Refresh cart và redirect
        fetchCartItems();
        navigate('/courses');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo URL thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.course?.price || 0);
      return total + price;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button onClick={() => navigate(-1)} 
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ Hàng</h1>
          <p className="text-gray-600">Quản lý các khóa học bạn muốn mua</p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-shopping-cart text-6xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Bạn chưa có khóa học nào trong giỏ hàng</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Khám phá khóa học
            </button>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Khóa học trong giỏ hàng ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.courseid} className="p-6 flex items-center space-x-4">
                      {/* Course Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={item.course?.imageurl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=100&fit=crop'}
                          alt={item.course?.coursename}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.course?.coursename || 'Tên khóa học'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          bởi {item.course?.teacher?.fullname || 'Giảng viên chưa xác định'}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400 mr-2">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                          </div>
                          <span className="text-sm text-gray-500">(4.8)</span>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.course?.price ? `${(parseFloat(item.course.price)).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleRemoveItem(item.courseid)}
                          disabled={isRemoving}
                          className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính ({cartItems.length} khóa học)</span>
                    <span className="font-medium">{calculateTotal().toLocaleString('vi-VN')} ₫</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-lg font-semibold text-teal-600">{calculateTotal().toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout()}
                  disabled={isProcessingPayment}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang xử lý thanh toán...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card mr-2"></i>
                      Thanh toán ngay
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
