const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// API để lấy danh sách đánh giá (công khai, không cần đăng nhập)
router.get('/:courseId', reviewController.getCourseReviews);

// API để lấy đánh giá của user cho một khóa học (yêu cầu đăng nhập)
router.get('/:courseId/my-review', authMiddleware.verifyToken, reviewController.getUserReview);

// API để tạo đánh giá mới (yêu cầu đăng nhập)
router.post('/:courseId', authMiddleware.verifyToken, reviewController.createReview);

// API để cập nhật đánh giá (yêu cầu đăng nhập)
router.put('/:courseId', authMiddleware.verifyToken, reviewController.updateReview);

module.exports = router;