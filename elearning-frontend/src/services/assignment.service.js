// src/services/assignment.service.js
import api from './api';

// === Assignment (Cho Giảng viên) ===
const getAssignmentsByCourse = (courseId) => api.get(`/assignments/course/${courseId}`);
const createAssignment = (data) => api.post('/assignments', data);
const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data);

// === Submission (Cho Học viên và Giảng viên) ===
// Học viên nộp bài (Backend tự lấy studentId)
const submitAssignment = (data) => api.post('/submissions', data); // { assignmentid, fileurl }

// Học viên xem bài nộp của mình (Backend tự lấy studentId)
const getMySubmission = (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`);

// Giảng viên chấm điểm
const gradeSubmission = (submissionId, data) => api.put(`/submissions/grade/${submissionId}`, data); // { grade, feedback }

export const assignmentService = {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  submitAssignment,
  getMySubmission,
  gradeSubmission,
};