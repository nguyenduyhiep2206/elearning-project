const { messages, users, Sequelize } = require("../models");
const { Op } = require('sequelize');

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
  }
};
