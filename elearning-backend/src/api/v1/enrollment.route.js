const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/enrollment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Áp dụng middleware xác thực cho tất cả route bên dưới
router.use(authMiddleware.verifyToken);

// Chỉ học viên (student) mới được đăng ký
// (Giả sử bạn có hàm roleMiddleware.isStudent)
router.post(
  '/',
  roleMiddleware.isStudent, // Bảo vệ: Chỉ student mới được gọi
  enrollmentController.createEnrollment
);

module.exports = router;