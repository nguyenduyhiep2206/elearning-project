// src/services/category.service.js
import api from './api';

const getAllCategories = () => api.get('/categories');

// MỚI: Thêm hàm này để khớp với route.js
const getCategoryById = (id) => api.get(`/categories/${id}`);

const createCategory = (data) => {
  // data là { categoryName, description }
  return api.post('/categories', data);
};

const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const categoryService = {
  getAllCategories,
  getCategoryById, // MỚI
  createCategory,
  updateCategory,
  deleteCategory,
};