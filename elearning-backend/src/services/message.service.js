const { messages, users } = require("../models");
const { Op, Sequelize } = require('sequelize');

module.exports = {
  async createMessage(senderId, receiverId, content) {

    return await messages.create({
      senderid: senderId,
      receiverid: receiverId,
      content
    });
  },

  async getMessages(userId, adminId) {
    return await messages.findAll({
      where: {
        [Op.or]: [
          { senderid: userId, receiverid: adminId },
          { senderid: adminId, receiverid: userId }
        ]
      },
      order: [['sentat', 'ASC']]
    });
  },

  async getChatUsers(adminId) {
    const rows = await messages.findAll({
      where: { receiverid: adminId },
      include: [{ model: users, as: "sender" }],
      attributes: ['senderid'],
      group: ['senderid', 'sender.userid']
    });

    return rows.map(row => row.sender);
  },

  async markSeen(userId, adminId) {
    return await messages.update(
      { seen: true },
      {
        where: {
          senderid: userId,
          receiverid: adminId,
          seen: false
        }
      }
    );
  },

  // Admin message management functions
  async getAllMessagesForAdmin({ page = 1, limit = 20, senderId, receiverId, search, startDate, endDate, seen }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (senderId) {
      where.senderid = parseInt(senderId);
    }
    if (receiverId) {
      where.receiverid = parseInt(receiverId);
    }
    if (search) {
      where.content = {
        [Op.iLike]: `%${search}%`
      };
    }
    if (startDate || endDate) {
      where.sentat = {};
      if (startDate) {
        where.sentat[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.sentat[Op.lte] = new Date(endDate);
      }
    }
    if (seen !== undefined) {
      where.seen = seen === 'true' || seen === true;
    }

    const { count, rows } = await messages.findAndCountAll({
      where,
      include: [
        { model: users, as: "sender", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'] },
        { model: users, as: "receiver", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'] }
      ],
      order: [['sentat', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      messages: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  },

  async getMessageStatsForAdmin() {
    const totalMessages = await messages.count();
    const unreadMessages = await messages.count({ where: { seen: false } });
    const readMessages = await messages.count({ where: { seen: true } });
    
    // Messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await messages.count({
      where: {
        sentat: {
          [Op.gte]: today
        }
      }
    });

    // Messages this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const messagesThisWeek = await messages.count({
      where: {
        sentat: {
          [Op.gte]: weekAgo
        }
      }
    });

    // Messages this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const messagesThisMonth = await messages.count({
      where: {
        sentat: {
          [Op.gte]: monthAgo
        }
      }
    });

    // Top senders
    const topSenders = await messages.findAll({
      attributes: [
        'senderid',
        [Sequelize.fn('COUNT', Sequelize.col('messageid')), 'messageCount']
      ],
      include: [
        { model: users, as: "sender", attributes: ['userid', 'fullname', 'email', 'role'] }
      ],
      group: ['senderid', 'sender.userid', 'sender.fullname', 'sender.email', 'sender.role'],
      order: [[Sequelize.literal('messageCount'), 'DESC']],
      limit: 10
    });

    return {
      totalMessages,
      unreadMessages,
      readMessages,
      messagesToday,
      messagesThisWeek,
      messagesThisMonth,
      topSenders: topSenders.map(item => ({
        user: item.sender,
        messageCount: parseInt(item.dataValues.messageCount)
      }))
    };
  },

  async deleteMessageForAdmin(messageId) {
    const message = await messages.findByPk(messageId);
    if (!message) {
      throw new Error('Tin nhắn không tồn tại');
    }
    await messages.destroy({ where: { messageid: messageId } });
    return { message: 'Xóa tin nhắn thành công' };
  },

  async deleteMultipleMessagesForAdmin(messageIds) {
    const count = await messages.destroy({
      where: {
        messageid: {
          [Op.in]: messageIds
        }
      }
    });
    return { deletedCount: count, message: `Đã xóa ${count} tin nhắn` };
  },

  async getAllConversationsForAdmin({ page = 1, limit = 20, adminId = null }) {
    if (!adminId) {
      throw new Error('Admin ID is required');
    }

    // Get unique user IDs that admin has conversations with
    // Using UNION to get both directions (admin as sender and admin as receiver)
    const senderMessages = await messages.findAll({
      where: { senderid: adminId },
      attributes: [
        'receiverid',
        [Sequelize.fn('MAX', Sequelize.col('sentat')), 'lastMessageTime'],
        [Sequelize.fn('COUNT', Sequelize.col('messageid')), 'messageCount']
      ],
      include: [
        { model: users, as: "receiver", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'], required: false }
      ],
      group: ['receiverid', 'receiver.userid', 'receiver.fullname', 'receiver.email', 'receiver.role', 'receiver.profilepicture'],
      raw: false
    });

    const receiverMessages = await messages.findAll({
      where: { receiverid: adminId },
      attributes: [
        'senderid',
        [Sequelize.fn('MAX', Sequelize.col('sentat')), 'lastMessageTime'],
        [Sequelize.fn('COUNT', Sequelize.col('messageid')), 'messageCount'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN \"seen\" = false THEN 1 ELSE 0 END")), 'unreadCount']
      ],
      include: [
        { model: users, as: "sender", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'], required: false }
      ],
      group: ['senderid', 'sender.userid', 'sender.fullname', 'sender.email', 'sender.role', 'sender.profilepicture'],
      raw: false
    });

    // Merge conversations by user ID
    const conversationMap = new Map();

    // Process messages where admin is sender
    senderMessages.forEach(msg => {
      const userId = msg.receiverid;
      const user = msg.receiver;
      if (!conversationMap.has(userId)) {
        conversationMap.set(userId, {
          userId,
          user,
          lastMessageTime: msg.dataValues.lastMessageTime,
          messageCount: parseInt(msg.dataValues.messageCount),
          unreadCount: 0
        });
      } else {
        const conv = conversationMap.get(userId);
        const msgTime = new Date(msg.dataValues.lastMessageTime);
        const convTime = new Date(conv.lastMessageTime);
        if (msgTime > convTime) {
          conv.lastMessageTime = msg.dataValues.lastMessageTime;
        }
        conv.messageCount += parseInt(msg.dataValues.messageCount);
      }
    });

    // Process messages where admin is receiver
    receiverMessages.forEach(msg => {
      const userId = msg.senderid;
      const user = msg.sender;
      if (!conversationMap.has(userId)) {
        conversationMap.set(userId, {
          userId,
          user,
          lastMessageTime: msg.dataValues.lastMessageTime,
          messageCount: parseInt(msg.dataValues.messageCount),
          unreadCount: parseInt(msg.dataValues.unreadCount || 0)
        });
      } else {
        const conv = conversationMap.get(userId);
        const msgTime = new Date(msg.dataValues.lastMessageTime);
        const convTime = new Date(conv.lastMessageTime);
        if (msgTime > convTime) {
          conv.lastMessageTime = msg.dataValues.lastMessageTime;
        }
        conv.messageCount += parseInt(msg.dataValues.messageCount);
        conv.unreadCount += parseInt(msg.dataValues.unreadCount || 0);
      }
    });

    // Get admin user info
    const adminUser = await users.findByPk(adminId, {
      attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture']
    });

    // Convert to array and format
    let conversations = Array.from(conversationMap.values()).map(conv => ({
      sender: adminUser,
      receiver: conv.user,
      lastMessageTime: conv.lastMessageTime,
      messageCount: conv.messageCount,
      unreadCount: conv.unreadCount
    }));

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    const totalCount = conversations.length;
    const offset = (page - 1) * limit;

    // Apply pagination
    const paginatedConversations = conversations.slice(offset, offset + parseInt(limit));

    return {
      conversations: paginatedConversations,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  },

  async searchMessagesForAdmin(searchTerm, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const where = {
      content: {
        [Op.iLike]: `%${searchTerm}%`
      }
    };

    const { count, rows } = await messages.findAndCountAll({
      where,
      include: [
        { model: users, as: "sender", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'] },
        { model: users, as: "receiver", attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture'] }
      ],
      order: [['sentat', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      messages: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }
};
