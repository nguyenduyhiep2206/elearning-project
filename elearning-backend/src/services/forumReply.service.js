// services/forumReply.service.js

const { forumreplies } = require('../models');

// Tạo 1 trả lời
exports.createReply = async (replyData) => {
  // replyData = { discussionid, userid, content }
  return await forumreplies.create(replyData);
};

exports.deleteReply = async (id, userId, userRole) => {
  const reply = await forumreplies.findByPk(id);
  if (!reply) throw new Error('Reply not found');

  // Chỉ chủ nhân hoặc admin/teacher mới được xóa
  if (reply.userid !== userId && userRole !== 'admin' && userRole !== 'teacher') {
    throw new Error('Unauthorized');
  }

  return await reply.destroy();
};