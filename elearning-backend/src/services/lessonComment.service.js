// services/lessonComment.service.js

const { lessoncomments, users } = require('../models');

// Lấy tất cả bình luận CỦA 1 BÀI HỌC
exports.getCommentsByLesson = async (lessonId) => {
  return await lessoncomments.findAll({
    where: { lessonid: lessonId },
    include: [{ 
      model: users, 
      as: 'student', 
      attributes: ['userid', 'fullname', 'profilepicture'] // Lấy thông tin người bình luận
    }],
    order: [['createdat', 'ASC']]
  });
};

exports.createComment = async (commentData) => {
  // commentData phải bao gồm { lessonid: 1, studentid: 1, content: "..." }
  return await lessoncomments.create(commentData);
};

exports.updateComment = async (commentId, studentId, content) => {
  const comment = await lessoncomments.findByPk(commentId);
  if (!comment) throw new Error('Comment not found');
  
  // Chỉ chủ nhân của bình luận mới được sửa
  if (comment.studentid !== studentId) {
    throw new Error('Unauthorized');
  }
  
  return await comment.update({ content });
};

exports.deleteComment = async (commentId, studentId, userRole) => {
  const comment = await lessoncomments.findByPk(commentId);
  if (!comment) throw new Error('Comment not found');
  
  // Chủ nhân bình luận hoặc admin/teacher mới được xóa
  if (comment.studentid !== studentId && userRole !== 'admin' && userRole !== 'teacher') {
    throw new Error('Unauthorized');
  }
  
  return await comment.destroy();
};