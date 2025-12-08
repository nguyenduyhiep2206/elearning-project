// controllers/category.controller.js

const categoryService = require('../services/category.service');

// Đồng bộ tên hàm với file route để dễ quản lý
const categoryController = {
    // [POST] /api/v1/categories
    createCategory: async (req, res) => {
        try {
            const { categoryName, description } = req.body;
            if (!categoryName) {
                return res.status(400).json({ message: "Category name is required." });
            }
            const newCategory = await categoryService.createCategory({ categoryname: categoryName, description });
            res.status(201).json({
                message: "Tạo danh mục thành công!",
                data: newCategory
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [GET] /api/v1/categories
    getAllCategories: async (req, res) => {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({
                message: "Lấy danh sách danh mục thành công!",
                data: categories
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [GET] /api/v1/categories/:id
    getCategoryById: async (req, res) => {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            if (category) {
                res.status(200).json({
                    message: "Tìm thấy danh mục!",
                    data: category
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [PUT] /api/v1/categories/:id
    updateCategory: async (req, res) => {
        try {
            const { categoryName, description } = req.body;
            if (!categoryName) {
                return res.status(400).json({ message: "Category name is required." });
            }
            // Convert categoryName (camelCase) to categoryname (snake_case) for database
            const updateData = {
                categoryname: categoryName,
                description: description || null
            };
            const updatedCategory = await categoryService.updateCategory(req.params.id, updateData);
            if (updatedCategory) {
                res.status(200).json({
                    message: "Cập nhật danh mục thành công!",
                    data: updatedCategory
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // [DELETE] /api/v1/categories/:id
    deleteCategory: async (req, res) => {
        try {
            const result = await categoryService.deleteCategory(req.params.id);
            if (result) {
                res.status(200).json({ message: 'Xóa danh mục thành công!' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy danh mục!' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
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