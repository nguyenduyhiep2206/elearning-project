// src/api/v1/answer.route.js

const express = require('express');
const router = express.Router();
const answerController = require('../../controllers/answer.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả các hành động làm bài thi ĐỀU PHẢI ĐĂNG NHẬP
router.use(authMiddleware.verifyToken);

// 1. Bắt đầu làm bài
router.post('/start', answerController.startQuiz);

// 2. Nộp bài
router.post('/submit', answerController.submitQuiz);

module.exports = router;