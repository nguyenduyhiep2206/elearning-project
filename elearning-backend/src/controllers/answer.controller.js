// src/controllers/answer.controller.js

const answerService = require('../services/answer.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// [POST] /api/v1/answers/start
// Body: { quizId: 1 }
exports.startQuiz = async (req, res) => {
  try {
    const studentId = req.user.userid; // Lấy từ token
    const { quizId } = req.body;

    if (!quizId) return res.status(400).json({ message: 'Missing quizId' });

    const session = await answerService.startQuiz(studentId, quizId);
    
    res.status(201).json({
      message: 'Bắt đầu làm bài!',
      session: session
    });
  } catch (error) {
    handleError(res, error);
  }
};

// [POST] /api/v1/answers/submit
// Body: { sessionId: 10, answers: [{ questionId: 1, selectedOptionId: 2 }, ...] }
exports.submitQuiz = async (req, res) => {
  try {
    const studentId = req.user.userid;
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const result = await answerService.submitQuiz(sessionId, studentId, answers);
    
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};