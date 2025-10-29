// src/services/course.service.js
import api from './api';

// === API Công khai (Cho mọi người) ===

const getAllCourses = (params) => {
  // params là { page, limit, search, categoryId }
  return api.get('/courses', { params });
};

const getCourseById = (id) => {
  // Backend dùng :courseId, nhưng chúng ta chỉ cần truyền id
  return api.get(`/courses/${id}`);
};

// CẬP NHẬT: Thêm 'limit'
const getPopularCourses = (limit = 8) => {
  return api.get('/courses/popular', { params: { limit } });
};

// CẬP NHẬT: Thêm 'limit'
const getLatestCourses = (limit = 8) => {
  return api.get('/courses/latest', { params: { limit } });
};

// MỚI: Thêm API tìm kiếm
const searchCourses = (params) => {
  // params là { q, page, limit }
  return api.get('/courses/search', { params });
};

// MỚI: Thêm API lấy khóa học theo giảng viên
const getCoursesByInstructor = (instructorId) => {
  return api.get(`/courses/instructor/${instructorId}`);
};


// === API Riêng (Cho Instructor) ===

const getMyCourses = (params) => {
  // params là { page, limit }
  return api.get('/courses/my-courses', { params });
};

const createCourse = (data) => {
  // data là { coursename, description, price, categoryid, ... }
  return api.post('/courses', data);
};

const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data);
};

const deleteCourse = (id) => {
  return api.delete(`/courses/${id}`);
};

export const courseService = {
  // Public
  getAllCourses,
  getCourseById,
  getPopularCourses, // Cập nhật
  getLatestCourses,  // Cập nhật
  searchCourses,       // Mới
  getCoursesByInstructor, // Mới
  // Instructor
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};