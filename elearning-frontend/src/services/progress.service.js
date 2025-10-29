//Dựa trên progress.route.js
// src/services/progress.service.js
import api from './api';

// Body chỉ cần { lessonId }. Backend tự lấy studentId từ token
const markLessonCompleted = (lessonId) => api.post('/progress/complete', { lessonId });
const getCourseProgress = (courseId) => api.get(`/progress/course/${courseId}`);

export const progressService = {
  markLessonCompleted,
  getCourseProgress,
};