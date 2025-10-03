// src/api/v1/index.js

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route'); // 1. Import auth route

// ... import các route khác ...

// 2. Dòng quan trọng: Đảm bảo bạn đang dùng auth route với tiền tố '/auth'
router.use('/auth', authRoutes);

// ... router.use() cho các route khác ...

module.exports = router;