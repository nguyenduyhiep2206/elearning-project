const express = require('express');
const router = express.Router();
const controller = require('../../controllers/submission.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.use(auth.verifyToken);

// Học viên nộp bài
router.post('/', controller.submitAssignment);

// Giáo viên xem danh sách nộp và chấm điểm
router.get('/assignment/:assignmentId', role.isInstructor, controller.getSubmissionsByAssignment);
router.put('/:id/grade', role.isInstructor, controller.gradeSubmission);

module.exports = router;