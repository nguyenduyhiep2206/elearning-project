// controllers/quiz.controller.js

const quizService = require('../services/quiz.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// API CÔNG KHAI (Học viên xem để làm bài)
exports.getQuizDetails = async (req, res) => {
  try {
    const quiz = await quizService.getQuizDetails(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    handleError(res, error);
  }
};

// === API RIÊNG TƯ (CHỈ INSTRUCTOR) ===

exports.createQuiz = async (req, res) => {
  try {
    const teacherId = req.user.userid; // Lấy ID giáo viên từ token
    const newQuiz = await quizService.createQuiz(req.body, teacherId);
    res.status(201).json(newQuiz);
  } catch (error) {
    if (error.message === 'Permission denied' || error.message === 'Lesson not found') {
        return res.status(403).json({ message: 'Bạn không có quyền tạo Quiz cho bài học này' });
    }
    handleError(res, error);
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const teacherId = req.user.userid;
    const updatedQuiz = await quizService.updateQuiz(req.params.id, req.body, teacherId);
    res.status(200).json(updatedQuiz);
  } catch (error) {
    if (error.message === 'Quiz not found') return res.status(404).json({ message: 'Quiz not found' });
    if (error.message === 'Permission denied') return res.status(403).json({ message: 'Không có quyền sửa Quiz này' });
    handleError(res, error);
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const teacherId = req.user.userid;
    await quizService.deleteQuiz(req.params.id, teacherId);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Quiz not found') return res.status(404).json({ message: 'Quiz not found' });
    if (error.message === 'Permission denied') return res.status(403).json({ message: 'Không có quyền xóa Quiz này' });
    handleError(res, error);
  }
};