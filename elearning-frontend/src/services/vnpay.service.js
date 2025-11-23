// src/services/vnpay.service.js

import api from './api';

class VNPayService {
  /**
   * Tạo URL thanh toán VNPAY
   * @param {Object} paymentData - Thông tin thanh toán { promotionCode?: string }
   * @returns {Promise} Response từ API
   */
  async createPaymentUrl(paymentData = {}) {
    try {
      // Backend chỉ cần promotionCode (nếu có)
      // Chỉ gửi promotionCode nếu nó có giá trị, không gửi null
      const requestData = {};
      if (paymentData && paymentData.promotionCode) {
        requestData.promotionCode = paymentData.promotionCode;
      }
      
      const response = await api.post('/payment/create-payment-url', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment URL:', error);
      throw error;
    }
  }

  /**
   * Chuyển hướng đến trang thanh toán VNPAY
   * @param {string} paymentUrl - URL thanh toán
   */
  redirectToPayment(paymentUrl) {
    window.location.href = paymentUrl;
  }

  /**
   * Tạo dữ liệu thanh toán từ thông tin đơn hàng
   * @param {Object} orderData - Thông tin đơn hàng
   * @returns {Object} Dữ liệu thanh toán
   */
  createPaymentData(orderData) {
    const {
      orderId,
      totalAmount,
      courseNames,
      bankCode = '',
      language = 'vn'
    } = orderData;

    return {
      orderId: orderId || `ORDER_${Date.now()}`,
      amount: totalAmount,
      orderDescription: `Thanh toán khóa học: ${courseNames}`,
      orderType: 'other',
      language,
      bankCode
    };
  }
}

export default new VNPayService();
