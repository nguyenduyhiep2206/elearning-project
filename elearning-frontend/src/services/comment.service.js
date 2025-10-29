//Dựa trên lessonComment.route.js
// src/services/comment.service.js
import api from './api';

const getCommentsByLesson = (lessonId) => api.get(`/lesson-comments/lesson/${lessonId}`);
// Backend tự lấy studentId từ token, body chỉ cần { lessonid, content }
const createComment = (data) => api.post('/lesson-comments', data);
// Tương tự, body cần { content }
const updateComment = (id, data) => api.put(`/lesson-comments/${id}`, data);
const deleteComment = (id) => api.delete(`/lesson-comments/${id}`);

export const commentService = {
  getCommentsByLesson,
  createComment,
  updateComment,
  deleteComment,
};