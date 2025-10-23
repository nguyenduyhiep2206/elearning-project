// services/category.service.js

const { categories, courses } = require('../models');

exports.getAllCategories = async () => {
  return await categories.findAll({
    include: [{
      model: courses,
      as: 'courses',
      attributes: ['courseid', 'coursename'] // Chỉ lấy thông tin cơ bản
    }]
  });
};

exports.getCategoryById = async (id) => {
  return await categories.findByPk(id, {
    include: [{ model: courses, as: 'courses' }] // Lấy tất cả khóa học
  });
};

exports.createCategory = async (categoryData) => {
  return await categories.create(categoryData);
};

exports.updateCategory = async (id, categoryData) => {
  const category = await categories.findByPk(id);
  if (!category) throw new Error('Category not found');
  return await category.update(categoryData);
};

exports.deleteCategory = async (id) => {
  const category = await categories.findByPk(id);
  if (!category) throw new Error('Category not found');
  return await category.destroy();
};