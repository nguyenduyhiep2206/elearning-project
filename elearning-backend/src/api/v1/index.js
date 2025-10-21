// src/api/v1/index.js

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route'); // 1. Import auth route
const courseRoutes = require('./course.route'); // Import course route
const categoryRoutes = require('./category.route');
const cartRoutes = require('./cart.route'); // Import cart route
const favoriteRoutes = require('./favorite.route'); // Import favorite route
const orderRoutes = require('./order.route');  // Import order route
const promotionRoutes = require('./promotion.route'); // Import promotion route
const reviewRoutes = require('./review.route'); // Import review route

// ... import các route khác ...

// 2. Dòng quan trọng: Đảm bảo bạn đang dùng auth route với tiền tố '/auth'
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes); // Sử dụng course route với tiền tố '/courses'

// ... router.use() cho các route khác ...
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes); // Sử dụng cart route với tiền tố '/cart'
router.use('/favorites', favoriteRoutes); // Sử dụng favorite route với tiền tố '/favorites'
router.use('/orders', orderRoutes); // Sử dụng order route với tiền tố '/orders'
router.use('/promotions', promotionRoutes); // Sử dụng promotion route với tiền tố '/promotions'
router.use('/reviews', reviewRoutes); // Sử dụng review route với tiền tố '/reviews'

module.exports = router;