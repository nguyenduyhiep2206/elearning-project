// api/routes/submission.routes.js

const express = require('express');
const router = express.Router();
const submissionController = require('../../controllers/submission.controller');
// const authStudent = require('../../middlewares/authStudent');
// const authTeacher = require('../../middlewares/authTeacher');

// router.post('/', authStudent, submissionController.submitAssignment);
router.post('/', submissionController.submitAssignment); // Tạm thời

// router.get('/assignment/:assignmentId', authStudent, submissionController.getSubmission);
router.get('/assignment/:assignmentId', submissionController.getSubmission); // Tạm thời

// router.put('/grade/:submissionId', authTeacher, submissionController.gradeSubmission);
router.put('/grade/:submissionId', submissionController.gradeSubmission); // Tạm thời

module.exports = router;