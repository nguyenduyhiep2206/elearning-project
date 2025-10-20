// src/controllers/message.controller.js

const messageService = require('../services/message.service');

exports.sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id; 
        const { receiverId, content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Nội dung message không được rỗng.' });
        }
        if (!receiverId || receiverId === senderId) {
            return res.status(400).json({ message: 'ReceiverId không hợp lệ.' });
        }

        const message = await messageService.sendMessage(senderId, receiverId, content.trim());
        res.status(201).json({ message: 'Gửi message thành công.', ...message });
    } catch (error) {
        next(error);
    }
};

exports.getChatHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otherUserId, page = 1, limit = 20 } = req.query;

        if (!otherUserId) {
            return res.status(400).json({ message: 'otherUserId là bắt buộc.' });
        }

        const result = await messageService.getChatHistory(
            userId, 
            parseInt(otherUserId), 
            parseInt(page), 
            parseInt(limit)
        );
        res.status(200).json({ message: 'Lấy lịch sử chat thành công.', ...result });
    } catch (error) {
        next(error);
    }
};