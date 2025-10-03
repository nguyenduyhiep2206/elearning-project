const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');

// GET /api/v1/users?page=1&limit=5
router.get('/', userController.getAllUsers);

// ... các routes cho Thêm, Sửa, Xóa sẽ được thêm vào đây

module.exports = router;