// api/routes/quiz.routes.js

const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/quiz.controller');

// IMPORT MIDDLEWARE
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// --- ROUTE CÔNG KHAI ---
// Học viên cần lấy chi tiết quiz để làm bài
router.get('/:id', quizController.getQuizDetails); 

// === BẢO VỆ CÁC API BÊN DƯỚI (CHỈ INSTRUCTOR) ===
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware.isInstructor);

// --- ROUTES RIÊNG TƯ (INSTRUCTOR) ---
router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;