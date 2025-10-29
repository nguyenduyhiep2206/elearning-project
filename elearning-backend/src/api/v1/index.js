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
const progressRoutes = require('./routes/progress.route');
const chapterRoutes = require('./routes/chapter.route');
const lessonRoutes = require('./routes/lesson.route');
const lessonCommentRoutes = require('./routes/lessonComment.route');
const assignmentRoutes = require('./routes/assignment.route');
const submissionRoutes = require('./routes/submission.route');
const quizRoutes = require('./routes/quiz.route');
const quizQuestionRoutes = require('./routes/quizQuestion.route');
const forumDiscussionRoutes = require('./routes/forumDiscussion.route');
const forumReplyRoutes = require('./routes/forumReply.route');

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

router.use('/progress', progressRoutes);           // /api/v1/progress
router.use('/chapters', chapterRoutes);           // /api/v1/chapters
router.use('/lessons', lessonRoutes);             // /api/v1/lessons
router.use('/comments', lessonCommentRoutes);     // /api/v1/comments
router.use('/assignments', assignmentRoutes);     // /api/v1/assignments
router.use('/submissions', submissionRoutes);     // /api/v1/submissions
router.use('/quizzes', quizRoutes);               // /api/v1/quizzes
router.use('/questions', quizQuestionRoutes);     // /api/v1/questions
router.use('/discussions', forumDiscussionRoutes); // /api/v1/discussions
router.use('/replies', forumReplyRoutes);         // /api/v1/replies

module.exports = router;