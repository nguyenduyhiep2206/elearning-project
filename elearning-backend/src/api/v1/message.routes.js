const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message.controller');
const { verifyToken } = require('../../middlewares/auth.middleware'); 
const authorizeRole = require('../../middlewares/role.middleware');

// Gửi tin nhắn
router.post(
  '/',
  verifyToken,
  authorizeRole(['Student', 'Teacher', 'Admin']),
  messageController.sendMessage
);

// Lịch sử chat giữa 2 user
router.get(
  '/chat/:otherUserId',
  verifyToken,
  authorizeRole(['Student', 'Teacher', 'Admin']),
  messageController.getChatHistory
);

module.exports = router;