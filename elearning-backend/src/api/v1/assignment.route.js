// api/routes/assignment.routes.js

const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/assignment.controller');
// const authTeacher = require('../../middlewares/authTeacher'); // Middleware check teacher/admin

// router.post('/', authTeacher, assignmentController.createAssignment);
router.post('/', assignmentController.createAssignment); // Tạm thời
router.get('/course/:courseId', assignmentController.getAssignmentsByCourse);
router.get('/:id', assignmentController.getAssignmentById);
// router.put('/:id', authTeacher, assignmentController.updateAssignment);
router.put('/:id', assignmentController.updateAssignment); // Tạm thời
// router.delete('/:id', authTeacher, assignmentController.deleteAssignment);
router.delete('/:id', assignmentController.deleteAssignment); // Tạm thời

module.exports = router;