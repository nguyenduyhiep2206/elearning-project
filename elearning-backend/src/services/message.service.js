const { Message, User } = require('../models'); 
const { Op } = require('sequelize'); 

// Gửi message mới
exports.sendMessage = async (senderId, receiverId, content) => {
    try {
        // Kiểm tra sender và receiver tồn tại
        const sender = await User.findByPk(senderId);
        const receiver = await User.findByPk(receiverId);
        if (!sender || !receiver) {
            throw new Error('Người gửi hoặc người nhận không tồn tại.');
        }

        // Tạo message
        const message = await Message.create({
            senderid: senderId,
            receiverid: receiverId,
            content
        });

        // Trả về message với info sender/receiver (không cần password)
        const senderInfo = { id: sender.userid, fullname: sender.fullname, email: sender.email };
        const receiverInfo = { id: receiver.userid, fullname: receiver.fullname, email: receiver.email };

        return {
            ...message.toJSON(),
            sender: senderInfo,
            receiver: receiverInfo
        };
    } catch (error) {
        throw new Error(`Lỗi khi gửi message: ${error.message}`);
    }
};

// Lấy lịch sử chat giữa 2 users (pagination)
exports.getChatHistory = async (userId, otherUserId, page = 1, limit = 20) => {
    try {
        const otherUser = await User.findByPk(otherUserId);
        if (!otherUser) {
            throw new Error('Người dùng khác không tồn tại.');
        }

        const offset = (page - 1) * limit;

        // Query messages giữa userId và otherUserId (cả chiều gửi/nhận)
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderid: userId, receiverid: otherUserId },
                    { senderid: otherUserId, receiverid: userId }
                ]
            },
            order: [['sentat', 'ASC']], 
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'sender', 
                    attributes: ['userid', 'fullname', 'email', 'profile_image']
                },
                {
                    model: User,
                    as: 'receiver', 
                    attributes: ['userid', 'fullname', 'email', 'profile_image']
                }
            ]
        });

        // Tính total items
        const totalItems = await Message.count({
            where: {
                [Op.or]: [
                    { senderid: userId, receiverid: otherUserId },
                    { senderid: otherUserId, receiverid: userId }
                ]
            }
        });

        // Thêm info users vào messages nếu chưa include
        const enrichedMessages = messages.map(msg => ({
            ...msg.toJSON(),
            sender: msg.sender ? msg.sender.toJSON() : { id: msg.senderid, fullname: 'Unknown' },
            receiver: msg.receiver ? msg.receiver.toJSON() : { id: msg.receiverid, fullname: 'Unknown' }
        }));

        return { messages: enrichedMessages, totalItems, currentPage: page, totalPages: Math.ceil(totalItems / limit) };
    } catch (error) {
        throw new Error(`Lỗi khi lấy lịch sử chat: ${error.message}`);
    }
};