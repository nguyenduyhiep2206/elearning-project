
const { Notification, User } = require('../models'); // Giả sử export Notification từ models

// Tạo notification mới
exports.createNotification = async (userId, message) => {
    try {
        const notification = await Notification.create({
            userid: userId,
            message
        });
        return notification.toJSON();
    } catch (error) {
        throw new Error(`Lỗi khi tạo notification: ${error.message}`);
    }
};

// Lấy list notifications của user (pagination, include unread count)
exports.getUserNotifications = async (userId, page = 1, limit = 10, readStatus = null) => {
    try {
        const offset = (page - 1) * limit;
        const where = { userid: userId };
        if (readStatus !== null) {
            where.isread = readStatus; 
        }

        const { count: totalItems, rows: notifications } = await Notification.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdat', 'DESC']] 
        });

        // Đếm unread
        const unreadCount = await Notification.count({ where: { userid: userId, isread: false } });

        return { notifications, totalItems, unreadCount };
    } catch (error) {
        throw new Error(`Lỗi khi lấy notifications: ${error.message}`);
    }
};

// Đánh dấu read/unread một hoặc nhiều notifications
exports.updateNotificationReadStatus = async (userId, notificationIds, isRead) => {
    try {
        const where = { 
            notificationid: notificationIds, 
            userid: userId 
        };
        const [updatedCount] = await Notification.update(
            { isread: isRead },
            { where }
        );

        if (updatedCount === 0) {
            throw new Error('Không tìm thấy notifications để cập nhật.');
        }

        return { updatedCount, message: `Đã cập nhật ${updatedCount} notifications.` };
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật status: ${error.message}`);
    }
};