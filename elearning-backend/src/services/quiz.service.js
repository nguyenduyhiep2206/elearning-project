// services/quiz.service.js

const { quizzes, quizquestions, quizoptions } = require('../models');

// Lấy 1 bài quiz (kèm tất cả câu hỏi và lựa chọn)
exports.getQuizDetails = async (id) => {
  return await quizzes.findByPk(id, {
    include: [{
      model: quizquestions,
      as: 'questions',
      include: [{
        model: quizoptions,
        as: 'options'
      }]
    }]
  });
};

// Tạo 1 bài quiz (chưa có câu hỏi)
exports.createQuiz = async (quizData) => {
  // quizData = { lessonid, title, timelimit... }
  return await quizzes.create(quizData);
};

exports.updateQuiz = async (id, quizData) => {
  const quiz = await quizzes.findByPk(id);
  if (!quiz) throw new Error('Quiz not found');
  return await quiz.update(quizData);
};

exports.deleteQuiz = async (id) => {
  const quiz = await quizzes.findByPk(id);
  if (!quiz) throw new Error('Quiz not found');
  // Cần xóa các câu hỏi, lựa chọn con...
  return await quiz.destroy();
};