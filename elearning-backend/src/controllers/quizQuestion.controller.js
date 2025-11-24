// controllers/quizQuestion.controller.js

const questionService = require('../services/quizQuestion.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.createQuestion = async (req, res) => {
  try {
    const teacherId = req.user.userid; // Lấy ID
    const newQuestion = await questionService.createQuestionWithOptions(req.body, teacherId);
    res.status(201).json(newQuestion);
  } catch (error) {
    if (error.message === 'Permission denied' || error.message === 'Quiz not found') {
        return res.status(403).json({ message: 'Không có quyền tạo câu hỏi cho Quiz này' });
    }
    handleError(res, error);
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const teacherId = req.user.userid;
    const updatedQuestion = await questionService.updateQuestion(req.params.id, req.body, teacherId);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    if (error.message === 'Question not found') return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    if (error.message === 'Permission denied') return res.status(403).json({ message: 'Không có quyền sửa câu hỏi này' });
    handleError(res, error);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const teacherId = req.user.userid;
    await questionService.deleteQuestion(req.params.id, teacherId);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Question not found') return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    if (error.message === 'Permission denied') return res.status(403).json({ message: 'Không có quyền xóa câu hỏi này' });
    handleError(res, error);
  }
};