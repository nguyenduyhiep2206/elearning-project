const reviewService = require('../services/review.service');

const reviewController = {
  // [POST] /api/v1/reviews/:courseId
  createReview: async (req, res) => {
    try {
      const studentId = req.user.id; // Lấy từ auth middleware
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ message: 'Vui lòng cung cấp xếp hạng (rating).' });
      }

      const newReview = await reviewService.createReview(studentId, Number(courseId), rating, comment);
      res.status(201).json({
        message: 'Cảm ơn bạn đã gửi đánh giá!',
        data: newReview
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // [PUT] /api/v1/reviews/:courseId
  updateReview: async (req, res) => {
    try {
      const studentId = req.user.id; // Lấy từ auth middleware
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ message: 'Vui lòng cung cấp xếp hạng (rating).' });
      }

      const updatedReview = await reviewService.updateReview(studentId, Number(courseId), rating, comment);
      res.status(200).json({
        message: 'Đã cập nhật đánh giá thành công!',
        data: updatedReview
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // [GET] /api/v1/reviews/:courseId/my-review
  getUserReview: async (req, res) => {
    try {
      const studentId = req.user.id; // Lấy từ auth middleware
      const { courseId } = req.params;
      const review = await reviewService.getUserReview(studentId, Number(courseId));
      
      if (!review) {
        return res.status(200).json({
          message: 'Bạn chưa đánh giá khóa học này.',
          data: null
        });
      }

      res.status(200).json({
        message: 'Lấy đánh giá thành công!',
        data: review
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống khi lấy đánh giá.' });
    }
  },

  // [GET] /api/v1/reviews/:courseId
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const reviews = await reviewService.getReviewsByCourseId(Number(courseId));
      res.status(200).json({
        message: 'Lấy danh sách đánh giá thành công!',
        data: reviews
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống khi lấy đánh giá.' });
    }
  }
};

module.exports = reviewController;