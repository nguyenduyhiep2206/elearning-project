// api/routes/progress.routes.js
const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/progress.controller');
// const authMiddleware = require('../../middlewares/auth');

// Đánh dấu hoàn thành bài học
// router.post('/complete', authMiddleware, progressController.markLessonCompleted);
router.post('/complete', progressController.markLessonCompleted); // Tạm thời

// Lấy tiến độ khóa học
// router.get('/course/:courseId', authMiddleware, progressController.getCourseProgress);
router.get('/course/:courseId', progressController.getCourseProgress); // Tạm thời

module.exports = router;