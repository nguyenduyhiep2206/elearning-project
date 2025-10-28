// api/routes/quiz.routes.js

const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/quiz.controller');

router.post('/', quizController.createQuiz);
router.get('/:id', quizController.getQuizDetails); // API lấy chi tiết quiz để làm bài
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;