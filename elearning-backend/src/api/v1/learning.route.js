const express = require('express');
const router = express.Router();
const learningController = require('../../controllers/learning.controller');
const { verifyToken, requireAuth } = require('../../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu authentication
router.use(verifyToken);
router.use(requireAuth);

// Lấy thông tin khóa học với chapters và lessons
router.get('/courses/:courseId', learningController.getCourseContent);

// Lấy thông tin lesson cụ thể
router.get('/lessons/:lessonId', learningController.getLesson);

// Cập nhật tiến độ học
router.put('/lessons/:lessonId/progress', learningController.updateProgress);

// Lấy danh sách khóa học đã đăng ký
router.get('/my-courses', learningController.getMyCourses);

// Quiz routes
// Lấy danh sách quiz của một lesson
router.get('/lessons/:lessonId/quizzes', learningController.getQuizzesByLesson);

// Bắt đầu làm quiz
router.post('/quizzes/:quizId/start', learningController.startQuiz);

// Lấy session hiện tại
router.get('/quizzes/:quizId/session', learningController.getCurrentSession);

// Nộp câu trả lời
router.post('/sessions/:sessionId/answers', learningController.submitAnswer);

// Nộp bài quiz
router.post('/sessions/:sessionId/submit', learningController.submitQuiz);

// Lấy kết quả quiz
router.get('/quizzes/:quizId/result', learningController.getQuizResult);

module.exports = router;

