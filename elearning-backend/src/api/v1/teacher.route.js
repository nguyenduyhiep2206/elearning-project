const express = require('express');
const router = express.Router();
const teacherController = require('../../controllers/teacher.controller');
const { verifyToken, requireAuth } = require('../../middlewares/auth.middleware');

// Tất cả routes đều cần authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/teacher/stats
 * @desc Lấy thống kê của teacher
 * @access Private (Teacher only)
 */
router.get('/stats', requireAuth, teacherController.getStats.bind(teacherController));

/**
 * @route GET /api/v1/teacher/courses
 * @desc Lấy danh sách khóa học của teacher
 * @access Private (Teacher only)
 */
router.get('/courses', requireAuth, teacherController.getMyCourses.bind(teacherController));

/**
 * @route GET /api/v1/teacher/courses/:id
 * @desc Lấy chi tiết khóa học của teacher
 * @access Private (Teacher only)
 */
router.get('/courses/:id', requireAuth, teacherController.getCourseById.bind(teacherController));

/**
 * @route POST /api/v1/teacher/courses
 * @desc Tạo khóa học mới
 * @access Private (Teacher only)
 */
router.post('/courses', requireAuth, teacherController.createCourse.bind(teacherController));

/**
 * @route PUT /api/v1/teacher/courses/:id
 * @desc Cập nhật khóa học
 * @access Private (Teacher only)
 */
router.put('/courses/:id', requireAuth, teacherController.updateCourse.bind(teacherController));

/**
 * @route DELETE /api/v1/teacher/courses/:id
 * @desc Xóa khóa học
 * @access Private (Teacher only)
 */
router.delete('/courses/:id', requireAuth, teacherController.deleteCourse.bind(teacherController));

/**
 * @route GET /api/v1/teacher/students
 * @desc Lấy danh sách học viên đã đăng ký khóa học
 * @access Private (Teacher only)
 */
router.get('/students', requireAuth, teacherController.getStudents.bind(teacherController));

/**
 * @route GET /api/v1/teacher/courses/:courseId/chapters
 * @desc Lấy danh sách chapters của khóa học
 * @access Private (Teacher only)
 */
router.get('/courses/:courseId/chapters', requireAuth, teacherController.getChapters.bind(teacherController));

/**
 * @route POST /api/v1/teacher/courses/:courseId/chapters
 * @desc Tạo chapter mới
 * @access Private (Teacher only)
 */
router.post('/courses/:courseId/chapters', requireAuth, teacherController.createChapter.bind(teacherController));

/**
 * @route PUT /api/v1/teacher/chapters/:chapterId
 * @desc Cập nhật chapter
 * @access Private (Teacher only)
 */
router.put('/chapters/:chapterId', requireAuth, teacherController.updateChapter.bind(teacherController));

/**
 * @route DELETE /api/v1/teacher/chapters/:chapterId
 * @desc Xóa chapter
 * @access Private (Teacher only)
 */
router.delete('/chapters/:chapterId', requireAuth, teacherController.deleteChapter.bind(teacherController));

/**
 * @route GET /api/v1/teacher/chapters/:chapterId/lessons
 * @desc Lấy danh sách lessons của chapter
 * @access Private (Teacher only)
 */
router.get('/chapters/:chapterId/lessons', requireAuth, teacherController.getLessons.bind(teacherController));

/**
 * @route POST /api/v1/teacher/chapters/:chapterId/lessons
 * @desc Tạo lesson mới
 * @access Private (Teacher only)
 */
router.post('/chapters/:chapterId/lessons', requireAuth, teacherController.createLesson.bind(teacherController));

/**
 * @route PUT /api/v1/teacher/lessons/:lessonId
 * @desc Cập nhật lesson
 * @access Private (Teacher only)
 */
router.put('/lessons/:lessonId', requireAuth, teacherController.updateLesson.bind(teacherController));

/**
 * @route DELETE /api/v1/teacher/lessons/:lessonId
 * @desc Xóa lesson
 * @access Private (Teacher only)
 */
router.delete('/lessons/:lessonId', requireAuth, teacherController.deleteLesson.bind(teacherController));

// Quiz routes
const quizController = require('../../controllers/quiz.controller');

/**
 * @route POST /api/v1/teacher/lessons/:lessonId/quizzes
 * @desc Tạo quiz mới
 * @access Private (Teacher only)
 */
router.post('/lessons/:lessonId/quizzes', requireAuth, quizController.createQuiz.bind(quizController));

/**
 * @route GET /api/v1/teacher/lessons/:lessonId/quizzes
 * @desc Lấy danh sách quiz của lesson
 * @access Private (Teacher only)
 */
router.get('/lessons/:lessonId/quizzes', requireAuth, quizController.getQuizzesByLesson.bind(quizController));

/**
 * @route GET /api/v1/teacher/quizzes/:quizId/results
 * @desc Lấy kết quả làm bài của học viên
 * @access Private (Teacher only)
 * NOTE: Route này phải được định nghĩa TRƯỚC route /quizzes/:quizId để tránh conflict
 */
router.get('/quizzes/:quizId/results', requireAuth, quizController.getQuizResults.bind(quizController));

/**
 * @route POST /api/v1/teacher/quizzes/:quizId/questions
 * @desc Tạo câu hỏi cho quiz
 * @access Private (Teacher only)
 * NOTE: Route này phải được định nghĩa TRƯỚC route /quizzes/:quizId để tránh conflict
 */
router.post('/quizzes/:quizId/questions', requireAuth, quizController.createQuestion.bind(quizController));

/**
 * @route GET /api/v1/teacher/quizzes/:quizId
 * @desc Lấy thông tin quiz
 * @access Private (Teacher only)
 */
router.get('/quizzes/:quizId', requireAuth, quizController.getQuizById.bind(quizController));

/**
 * @route PUT /api/v1/teacher/quizzes/:quizId
 * @desc Cập nhật quiz
 * @access Private (Teacher only)
 */
router.put('/quizzes/:quizId', requireAuth, quizController.updateQuiz.bind(quizController));

/**
 * @route DELETE /api/v1/teacher/quizzes/:quizId
 * @desc Xóa quiz
 * @access Private (Teacher only)
 */
router.delete('/quizzes/:quizId', requireAuth, quizController.deleteQuiz.bind(quizController));

/**
 * @route PUT /api/v1/teacher/questions/:questionId
 * @desc Cập nhật câu hỏi
 * @access Private (Teacher only)
 */
router.put('/questions/:questionId', requireAuth, quizController.updateQuestion.bind(quizController));

/**
 * @route DELETE /api/v1/teacher/questions/:questionId
 * @desc Xóa câu hỏi
 * @access Private (Teacher only)
 */
router.delete('/questions/:questionId', requireAuth, quizController.deleteQuestion.bind(quizController));

/**
 * @route PUT /api/v1/teacher/quiz-sessions/:sessionId/score
 * @desc Cập nhật điểm cho session
 * @access Private (Teacher only)
 */
router.put('/quiz-sessions/:sessionId/score', requireAuth, quizController.updateQuizScore.bind(quizController));

module.exports = router;

