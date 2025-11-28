const messageService = require("../services/message.service");

module.exports = {
  async sendMessage(req, res) {
    try {
    
      const { receiverId, content } = req.body;
      const senderId = req.user.id;
console.log("🔥 req.user:", req.user);

      const msg = await messageService.createMessage(senderId, receiverId, content);

      return res.json({ status: true, data: msg });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const adminId = 5;

      const messages = await messageService.getMessages(userId, adminId);

      return res.json({ status: true, data: messages });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getChatUsers(req, res) {
    try {
      const adminId = req.user.id;

      const users = await messageService.getChatUsers(adminId);

      return res.json({ status: true, data: users });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async markMessagesAsSeen(req, res) {
    try {
      const { userId } = req.body;
      const adminId = req.user.userid;

      await messageService.markSeen(userId, adminId);

      return res.json({ status: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
