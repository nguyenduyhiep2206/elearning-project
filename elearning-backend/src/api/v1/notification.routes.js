// src/routes/notification.routes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const authorizeRole = require('../../middlewares/role.middleware');
router.post('/', verifyToken, authorizeRole(['Admin']), notificationController.createNotification);
router.get('/', verifyToken, notificationController.getUserNotifications);
router.put('/read-status', verifyToken, notificationController.updateNotificationReadStatus);

module.exports = router;