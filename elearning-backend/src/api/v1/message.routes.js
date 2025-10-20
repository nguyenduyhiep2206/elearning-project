// src/routes/message.routes.js

const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message.controller');
const authMiddleware = require('../../middlewares/auth.middleware'); // Import auth
const authorizeRole = require('../../middlewares/role.middleware');
router.post('/', authMiddleware, authorizeRole(['Student', 'Teacher', 'Admin']), messageController.sendMessage);
router.get('/chat/:otherUserId', authMiddleware, authorizeRole(['Student', 'Teacher', 'Admin']), messageController.getChatHistory);

module.exports = router;