const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/progress.controller');
// IMPORT MIDDLEWARE
const authMiddleware = require('../../middlewares/auth.middleware');

// === BẢO VỆ TẤT CẢ API TIẾN ĐỘ ===
// Phải đăng nhập mới biết được tiến độ
router.use(authMiddleware.verifyToken);

// Đánh dấu hoàn thành bài học
router.post('/complete', progressController.markLessonCompleted);

// Lấy tiến độ khóa học
router.get('/course/:courseId', progressController.getCourseProgress);

module.exports = router;