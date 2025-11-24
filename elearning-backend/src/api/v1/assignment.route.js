const express = require('express');
const router = express.Router();
const controller = require('../../controllers/assignment.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

router.get('/course/:courseId', controller.getAssignmentsByCourse); // Công khai (hoặc cần login tùy bạn)

router.use(auth.verifyToken);
router.post('/', role.isInstructor, controller.createAssignment);

module.exports = router;