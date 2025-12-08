const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

/**
 * @route GET /api/v1/admin/orders
 * @desc Lấy tất cả đơn hàng (cho admin)
 * @access Private (Admin only)
 */
router.get('/orders', verifyToken, requireAdmin, adminController.getAllOrders.bind(adminController));

/**
 * @route GET /api/v1/admin/orders/:id
 * @desc Lấy chi tiết đơn hàng (cho admin)
 * @access Private (Admin only)
 */
router.get('/orders/:id', verifyToken, requireAdmin, adminController.getOrderById.bind(adminController));

/**
 * @route PUT /api/v1/admin/orders/:id/status
 * @desc Cập nhật trạng thái đơn hàng
 * @access Private (Admin only)
 */
router.put('/orders/:id/status', verifyToken, requireAdmin, adminController.updateOrderStatus.bind(adminController));

/**
 * @route GET /api/v1/admin/pending-courses
 * @desc Lấy danh sách khóa học chờ duyệt
 * @access Private (Admin only)
 */
router.get('/pending-courses', verifyToken, requireAdmin, adminController.getPendingCourses.bind(adminController));

/**
 * @route POST /api/v1/admin/approve-course/:id
 * @desc Duyệt khóa học
 * @access Private (Admin only)
 */
router.post('/approve-course/:id', verifyToken, requireAdmin, adminController.approveCourse.bind(adminController));

/**
 * @route POST /api/v1/admin/reject-course/:id
 * @desc Từ chối khóa học
 * @access Private (Admin only)
 */
router.post('/reject-course/:id', verifyToken, requireAdmin, adminController.rejectCourse.bind(adminController));

/**
 * @route GET /api/v1/admin/reviews
 * @desc Lấy tất cả đánh giá (cho admin)
 * @access Private (Admin only)
 */
router.get('/reviews', verifyToken, requireAdmin, adminController.getAllReviews.bind(adminController));

/**
 * @route DELETE /api/v1/admin/reviews/:id
 * @desc Xóa đánh giá
 * @access Private (Admin only)
 */
router.delete('/reviews/:id', verifyToken, requireAdmin, adminController.deleteReview.bind(adminController));

/**
 * @route GET /api/v1/admin/promotions
 * @desc Lấy tất cả mã giảm giá (cho admin)
 * @access Private (Admin only)
 */
router.get('/promotions', verifyToken, requireAdmin, adminController.getAllPromotions.bind(adminController));

/**
 * @route GET /api/v1/admin/promotions/:id
 * @desc Lấy chi tiết mã giảm giá
 * @access Private (Admin only)
 */
router.get('/promotions/:id', verifyToken, requireAdmin, adminController.getPromotionById.bind(adminController));

/**
 * @route POST /api/v1/admin/promotions
 * @desc Tạo mã giảm giá mới
 * @access Private (Admin only)
 */
router.post('/promotions', verifyToken, requireAdmin, adminController.createPromotion.bind(adminController));

/**
 * @route PUT /api/v1/admin/promotions/:id
 * @desc Cập nhật mã giảm giá
 * @access Private (Admin only)
 */
router.put('/promotions/:id', verifyToken, requireAdmin, adminController.updatePromotion.bind(adminController));

/**
 * @route DELETE /api/v1/admin/promotions/:id
 * @desc Xóa mã giảm giá
 * @access Private (Admin only)
 */
router.delete('/promotions/:id', verifyToken, requireAdmin, adminController.deletePromotion.bind(adminController));

/**
 * @route GET /api/v1/admin/messages
 * @desc Lấy tất cả tin nhắn (cho admin)
 * @access Private (Admin only)
 */
router.get('/messages', verifyToken, requireAdmin, adminController.getAllMessages.bind(adminController));

/**
 * @route GET /api/v1/admin/messages/stats
 * @desc Lấy thống kê tin nhắn (cho admin)
 * @access Private (Admin only)
 */
router.get('/messages/stats', verifyToken, requireAdmin, adminController.getMessageStats.bind(adminController));

/**
 * @route GET /api/v1/admin/messages/conversations
 * @desc Lấy tất cả cuộc trò chuyện (cho admin)
 * @access Private (Admin only)
 */
router.get('/messages/conversations', verifyToken, requireAdmin, adminController.getAllConversations.bind(adminController));

/**
 * @route GET /api/v1/admin/messages/search
 * @desc Tìm kiếm tin nhắn (cho admin)
 * @access Private (Admin only)
 */
router.get('/messages/search', verifyToken, requireAdmin, adminController.searchMessages.bind(adminController));

/**
 * @route DELETE /api/v1/admin/messages/:id
 * @desc Xóa tin nhắn (cho admin)
 * @access Private (Admin only)
 */
router.delete('/messages/:id', verifyToken, requireAdmin, adminController.deleteMessage.bind(adminController));

/**
 * @route DELETE /api/v1/admin/messages
 * @desc Xóa nhiều tin nhắn (cho admin)
 * @access Private (Admin only)
 */
router.delete('/messages', verifyToken, requireAdmin, adminController.deleteMultipleMessages.bind(adminController));

module.exports = router;
