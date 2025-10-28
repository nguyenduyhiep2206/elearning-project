// api/routes/forumReply.routes.js

const express = require('express');
const router = express.Router();
const replyController = require('../../controllers/forumReply.controller');
// const authMiddleware = require('../../middlewares/auth');

// router.post('/', authMiddleware, replyController.createReply);
router.post('/', replyController.createReply); // Tạm thời

// router.delete('/:id', authMiddleware, replyController.deleteReply);
router.delete('/:id', replyController.deleteReply); // Tạm thời

module.exports = router;