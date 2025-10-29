//Dựa trên quiz.route.js
// src/services/quiz.service.js
import api from './api';

const getQuizDetails = (id) => api.get(`/quizzes/${id}`);
const createQuiz = (data) => api.post('/quizzes', data);
const updateQuiz = (id, data) => api.put(`/quizzes/${id}`, data);

export const quizService = {
  getQuizDetails,
  createQuiz,
  updateQuiz,
};