// controllers/quizQuestion.controller.js

const questionService = require('../services/quizQuestion.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// Tạo câu hỏi và các lựa chọn
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = await questionService.createQuestionWithOptions(req.body);
    res.status(201).json(newQuestion);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await questionService.updateQuestion(req.params.id, req.body);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await questionService.deleteQuestion(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};