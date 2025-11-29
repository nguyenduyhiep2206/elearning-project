const { VNPay } = require('vnpay');

// VNPay Configuration
const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE || '17EJVP1S', // Terminal ID từ email VNPay
  secretKey: process.env.VNPAY_HASH_SECRET || 'D1TKG5J8R0SAHII8J79CUJGDUOAAR3XF', // Secret Key từ email VNPay
  sandbox: true, // Sử dụng sandbox
  returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/v1/payment/vnpay-return',
  ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/v1/payment/vnpay-ipn',
};

// Khởi tạo VNPay instance
const vnpay = new VNPay({
  vnpayHost: VNPAY_CONFIG.sandbox ? 'https://sandbox.vnpayment.vn' : 'https://www.vnpayment.vn',
  tmnCode: VNPAY_CONFIG.tmnCode,
  secureSecret: VNPAY_CONFIG.secretKey,
  testMode: VNPAY_CONFIG.sandbox,
});

/**
 * Format date theo định dạng VNPay: yyyyMMddHHmmss (dạng string)
 * VNPay yêu cầu format là string, không phải number
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // Trả về string thay vì number để đảm bảo format đúng
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Tạo payment URL từ VNPay
 */
const createPaymentUrl = (orderId, amount, orderInfo = '', orderType = 'other', locale = 'vn', ipAddr = '127.0.0.1') => {
  try {
    const date = new Date();
    const createDate = formatDate(date);
    const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    // Tạo payment URL sử dụng thư viện vnpay
    // Thư viện vnpay sẽ tự động nhân 100, nên chỉ cần gửi số tiền VND trực tiếp
    const amountVND = Math.round(amount);
    
    // VNPay yêu cầu orderInfo không có ký tự đặc biệt
    // Loại bỏ dấu tiếng Việt và ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng
    let cleanOrderInfo = (orderInfo || `Thanh toan don hang ${orderId}`)
      .normalize('NFD') // Tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/[^a-zA-Z0-9\s]/g, '') // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng
      .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
      .trim()
      .substring(0, 255); // Giới hạn độ dài
    
    // OrderId phải là số hoặc string không có ký tự đặc biệt
    // Giữ nguyên orderId vì nó là số từ database
    const cleanOrderId = orderId.toString();
    
    const paymentParams = {
      vnp_Amount: amountVND, // Số tiền VND (thư viện sẽ tự động nhân 100)
      vnp_IpAddr: ipAddr,
      vnp_OrderInfo: cleanOrderInfo,
      vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
      vnp_TxnRef: cleanOrderId,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
      vnp_Locale: locale,
      vnp_OrderType: orderType,
    };

    const paymentUrl = vnpay.buildPaymentUrl(paymentParams);

    return paymentUrl;
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    throw error;
  }
};

/**
 * Xác thực chữ ký từ VNPay callback
 */
const verifyPaymentSignature = (vnp_Params) => {
  try {
    // Sử dụng thư viện vnpay để verify signature
    const result = vnpay.verifyReturnUrl(vnp_Params);
    // result.isVerified: xác thực chữ ký
    // result.isSuccess: giao dịch thành công (responseCode === '00')
    return result.isVerified;
  } catch (error) {
    console.error('Error verifying VNPay signature:', error);
    return false;
  }
};

/**
 * Lấy IP address từ request
 */
const getIpAddress = (req) => {
  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    '127.0.0.1';
  
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  
  if (ip.includes('::')) {
    const ipv4Match = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
    if (ipv4Match) {
      ip = ipv4Match[1];
    } else {
      ip = '127.0.0.1';
    }
  }
  
  return ip;
};

module.exports = {
  createPaymentUrl,
  verifyPaymentSignature,
  getIpAddress,
  VNPAY_CONFIG,
};

