// api/routes/quizQuestion.routes.js

const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/quizQuestion.controller');

router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
// Lấy câu hỏi thường sẽ đi kèm với API lấy chi tiết Quiz

module.exports = router;