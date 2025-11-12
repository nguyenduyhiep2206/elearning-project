const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/lessonComment.controller');
// IMPORT MIDDLEWARE
const authMiddleware = require('../../middlewares/auth.middleware');
// (Bạn có thể import thêm roleMiddleware nếu cần isStudent)

// API công khai (Tất cả mọi người)
router.get('/lesson/:lessonId', commentController.getCommentsByLesson); 

// === BẢO VỆ CÁC API BÊN DƯỚI ===
// Chỉ những người đã đăng nhập mới được bình luận, sửa, xóa
router.use(authMiddleware.verifyToken);

// API riêng tư (Học viên đã đăng nhập)
router.post('/', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;