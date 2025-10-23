// api/routes/course.routes.js
const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/course.controller');
// const authMiddleware = require('../../middlewares/auth'); // Nên có
// const roleMiddleware = require('../../middlewares/role'); // (Admin/Teacher)

// router.post('/', authMiddleware, roleMiddleware(['admin', 'teacher']), courseController.createCourse);
router.post('/', courseController.createCourse); // Tạm thời chưa có auth
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;