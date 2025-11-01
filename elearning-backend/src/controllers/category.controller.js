// controllers/category.controller.js

const categoryService = require('../services/category.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await categoryService.getAllCategories();
    res.status(200).json(allCategories);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json(updatedCategory);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};