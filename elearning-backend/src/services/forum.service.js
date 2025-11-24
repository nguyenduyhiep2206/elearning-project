// src/services/forum.service.js
const { forumdiscussions, forumreplies, users } = require('../models');

// === DISCUSSIONS ===
exports.createDiscussion = async (data) => {
    return await forumdiscussions.create(data);
};

exports.getDiscussionsByCourse = async (courseId) => {
    return await forumdiscussions.findAll({
        where: { courseid: courseId },
        include: [{ model: users, as: 'createdbyUser', attributes: ['fullname', 'profilepicture'] }], // Cần check alias trong model
        order: [['createdat', 'DESC']]
    });
};

exports.getDiscussionById = async (id) => {
    return await forumdiscussions.findByPk(id, {
        include: [
            { model: users, as: 'createdbyUser', attributes: ['fullname'] },
            { 
                model: forumreplies, 
                as: 'forumreplies', // Check alias
                include: [{ model: users, as: 'user', attributes: ['fullname', 'profilepicture'] }]
            }
        ]
    });
};

// === REPLIES ===
exports.createReply = async (data) => {
    return await forumreplies.create(data);
};

exports.deleteReply = async (replyId, userId, userRole) => {
    const reply = await forumreplies.findByPk(replyId);
    if (!reply) throw new Error('Reply not found');

    // Chỉ chủ nhân hoặc Admin/Teacher mới được xóa
    if (reply.userid !== userId && userRole !== 'admin' && userRole !== 'teacher') {
        throw new Error('Unauthorized');
    }
    return await reply.destroy();
};