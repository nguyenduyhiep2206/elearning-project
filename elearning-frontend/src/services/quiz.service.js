import api from './api'; // ĐÚNG

export const quizService = {
  // === QUẢN LÝ (Giáo viên) ===
  getQuizById: (id) => {
    return api.get(`/quizzes/${id}`);
  },

  createQuiz: (data) => {
    return api.post('/quizzes', data);
  },

  updateQuiz: (id, data) => {
    return api.put(`/quizzes/${id}`, data);
  },
  
  deleteQuiz: (id) => {
    return api.delete(`/quizzes/${id}`);
  },

  // === LÀM BÀI THI (Học viên) ===
  
  // 1. Bắt đầu làm bài (Lấy session)
  startQuiz: (quizId) => {
    return api.post('/answers/start', { quizId });
  },

  // 2. Nộp bài (Chấm điểm)
  submitQuiz: (data) => {
    // data: { sessionId, answers: [...] }
    return api.post('/answers/submit', data);
  }
};