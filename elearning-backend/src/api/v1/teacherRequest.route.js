const express = require('express');
const router = express.Router();
const teacherRequestController = require('../../controllers/teacherRequest.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

// Tạo yêu cầu trở thành giảng viên (user đã đăng nhập)
router.post('/', verifyToken, teacherRequestController.submitRequest);

// Lấy yêu cầu của user hiện tại
router.get('/my-request', verifyToken, teacherRequestController.getMyRequest);

// Lấy tất cả yêu cầu (chỉ admin)
router.get('/', verifyToken, requireAdmin, teacherRequestController.getAllRequests);

// Lấy số lượng yêu cầu đang chờ duyệt (chỉ admin)
router.get('/pending/count', verifyToken, requireAdmin, teacherRequestController.getPendingCount);

// Lấy yêu cầu theo ID (chỉ admin)
router.get('/:id', verifyToken, requireAdmin, teacherRequestController.getRequestById);

// Duyệt yêu cầu (chỉ admin)
router.post('/:id/approve', verifyToken, requireAdmin, teacherRequestController.approveRequest);

// Từ chối yêu cầu (chỉ admin)
router.post('/:id/reject', verifyToken, requireAdmin, teacherRequestController.rejectRequest);

module.exports = router;

