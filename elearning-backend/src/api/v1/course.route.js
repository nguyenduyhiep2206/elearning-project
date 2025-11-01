const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/course.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Routes công khai (không cần authentication)
router.get('/', courseController.getAllCourses); // Lấy tất cả khóa học
router.get('/popular', courseController.getPopularCourses); // Lấy khóa học phổ biến
router.get('/latest', courseController.getLatestCourses); // Lấy khóa học mới nhất
router.get('/search', courseController.searchCourses); // Tìm kiếm khóa học
router.get('/:courseId', courseController.getCourseById); // Lấy khóa học theo ID
router.get('/instructor/:instructorId', courseController.getCoursesByInstructor); // Lấy khóa học theo instructor

// Routes cần authentication (chỉ instructor)
router.use(authMiddleware.verifyToken); // Middleware xác thực cho tất cả routes bên dưới

// Routes chỉ dành cho instructor
router.post('/', courseController.createCourse); // Tạo khóa học mới
router.put('/:courseId', courseController.updateCourse); // Cập nhật khóa học
router.delete('/:courseId', courseController.deleteCourse); // Xóa khóa học
router.get('/my-courses', courseController.getMyCourses); // Lấy khóa học của tôi

module.exports = router;
