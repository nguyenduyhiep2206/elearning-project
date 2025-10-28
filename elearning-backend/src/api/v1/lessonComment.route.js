// api/routes/lessonComment.routes.js

const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/lessonComment.controller');
// const authMiddleware = require('../../middlewares/auth');

// router.post('/', authMiddleware, commentController.createComment);
router.post('/', commentController.createComment); // Tạm thời

// router.put('/:id', authMiddleware, commentController.updateComment);
router.put('/:id', commentController.updateComment); // Tạm thời

// router.delete('/:id', authMiddleware, commentController.deleteComment);
router.delete('/:id', commentController.deleteComment); // Tạm thời

router.get('/lesson/:lessonId', commentController.getCommentsByLesson); // API Lấy bình luận theo bài học

module.exports = router;