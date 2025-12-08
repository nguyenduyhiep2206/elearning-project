import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {success ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-gray-600 mb-4">
                  Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành công.
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Mã đơn hàng: <span className="font-semibold">{orderId}</span>
                  </p>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Xem khóa học của tôi
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Về trang chủ
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanh toán thất bại
                </h2>
                <p className="text-gray-600 mb-4">
                  {message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Mã đơn hàng: <span className="font-semibold">{orderId}</span>
                  </p>
                )}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Thử lại thanh toán
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Về trang chủ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default PaymentResultPage;

