// services/forumDiscussion.service.js

const { forumdiscussions, forumreplies, users } = require('../models');

// Lấy tất cả thảo luận CỦA 1 KHÓA HỌC
exports.getDiscussionsByCourse = async (courseId) => {
  return await forumdiscussions.findAll({
    where: { courseid: courseId },
    include: [{ 
      model: users, 
      as: 'author', 
      attributes: ['userid', 'fullname', 'profilepicture'] 
    }],
    order: [['createdat', 'DESC']]
  });
};

// Lấy chi tiết 1 thảo luận (kèm các trả lời)
exports.getDiscussionById = async (id) => {
  return await forumdiscussions.findByPk(id, {
    include: [
      { model: users, as: 'author', attributes: ['userid', 'fullname'] },
      {
        model: forumreplies,
        as: 'replies',
        include: [{ model: users, as: 'author', attributes: ['userid', 'fullname'] }],
        order: [['createdat', 'ASC']]
      }
    ]
  });
};

exports.createDiscussion = async (discussionData) => {
  // discussionData = { courseid, title, createdby (userid) }
  return await forumdiscussions.create(discussionData);
};