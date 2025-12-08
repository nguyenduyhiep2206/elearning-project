// src/controllers/notification.controller.js

const notificationService = require('../services/notification.service');

exports.createNotification = async (req, res, next) => {
    try {
        const { userId, message } = req.body; // Admin gửi cho userId
        const notification = await notificationService.createNotification(userId, message);
        res.status(201).json({ message: 'Tạo notification thành công.', notification });
    } catch (error) {
        next(error);
    }
};

exports.getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id; // Từ auth
        const { page = 1, limit = 10, readStatus } = req.query;
        const result = await notificationService.getUserNotifications(
            userId, 
            parseInt(page), 
            parseInt(limit), 
            readStatus === 'true' ? true : readStatus === 'false' ? false : null
        );
        res.status(200).json({ message: 'Lấy notifications thành công.', ...result });
    } catch (error) {
        next(error);
    }
};

exports.updateNotificationReadStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { ids } = req.body; // Array [1,2,3]
        const { isRead } = req.body; // true/false
        const result = await notificationService.updateNotificationReadStatus(userId, ids, isRead);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};