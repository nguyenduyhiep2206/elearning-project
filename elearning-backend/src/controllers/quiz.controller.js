// controllers/quiz.controller.js

const quizService = require('../services/quiz.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

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

exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = await quizService.createQuiz(req.body);
    res.status(201).json(newQuiz);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await quizService.updateQuiz(req.params.id, req.body);
    res.status(200).json(updatedQuiz);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await quizService.deleteQuiz(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};