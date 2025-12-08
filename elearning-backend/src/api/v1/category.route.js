// src/api/v1/category.route.js
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

// GET routes - Public (có thể xem danh sách và chi tiết)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// POST, PUT, DELETE routes - Protected (chỉ admin)
router.post('/', verifyToken, requireAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, requireAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
