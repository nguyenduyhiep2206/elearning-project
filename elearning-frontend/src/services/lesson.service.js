//Gộp chapter.route.js và lesson.route.js
// src/services/lesson.service.js
import api from './api';

// Chapter
const getChaptersByCourse = (courseId) => api.get(`/chapters/course/${courseId}`);
const createChapter = (data) => api.post('/chapters', data); // { courseid, title }
const updateChapter = (id, data) => api.put(`/chapters/${id}`, data); // { title }
const deleteChapter = (id) => api.delete(`/chapters/${id}`);

// Lesson
const getLessonsByChapter = (chapterId) => api.get(`/lessons/chapter/${chapterId}`);
const getLessonById = (id) => api.get(`/lessons/${id}`);
const createLesson = (data) => api.post('/lessons', data); // { chapterid, title, videourl, duration }
const updateLesson = (id, data) => api.put(`/lessons/${id}`, data);
const deleteLesson = (id) => api.delete(`/lessons/${id}`);

export const lessonService = {
  getChaptersByCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  getLessonsByChapter,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};