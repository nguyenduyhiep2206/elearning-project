// api/routes/quizQuestion.routes.js

const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/quizQuestion.controller');

// IMPORT MIDDLEWARE
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// === BẢO VỆ TẤT CẢ API (CHỈ INSTRUCTOR) ===
// Không có API nào công khai, vì câu hỏi luôn đi kèm với Quiz
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware.isInstructor);

router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;