// src/routes/notification.routes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const authMiddleware = require('../../middlewares/auth.middleware'); // Import auth
const authorizeRole = require('../../middlewares/role.middleware');
router.post('/', authMiddleware, authorizeRole(['Admin']), notificationController.createNotification);
router.get('/', authMiddleware, notificationController.getUserNotifications);
router.put('/read-status', authMiddleware, notificationController.updateNotificationReadStatus);

module.exports = router;