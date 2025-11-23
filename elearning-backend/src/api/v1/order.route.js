const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả các route về đơn hàng đều yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// GET /api/v1/orders - Lấy lịch sử đơn hàng của người dùng
router.get('/', orderController.getUserOrders);

// POST /api/v1/orders/checkout - Tạo đơn hàng từ giỏ hàng
router.post('/checkout', orderController.createOrder);

// POST /api/v1/orders/:orderId/cancel - Hủy đơn hàng (phải đặt trước route :orderId)
router.post('/:orderId/cancel', orderController.cancelOrder);

// GET /api/v1/orders/:orderId - Lấy chi tiết một đơn hàng cụ thể
router.get('/:orderId', orderController.getOrderDetails);

module.exports = router;