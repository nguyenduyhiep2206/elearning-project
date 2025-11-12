// controllers/lessonComment.controller.js

const commentService = require('../services/lessonComment.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getCommentsByLesson = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByLesson(req.params.lessonId);
    res.status(200).json(comments);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createComment = async (req, res) => {
  try {
    // 1. Lấy studentId từ auth middleware
    const studentId = req.user.userid; 
    
    // 2. Lấy dữ liệu từ body
    const { lessonid, content } = req.body;
    if (!lessonid || !content) {
      return res.status(400).json({ message: 'Thiếu lessonid hoặc content' });
    }

    // 3. Gọi service
    const newComment = await commentService.createComment({ 
      lessonid, 
      content, 
      studentid: studentId // Gán studentId từ token
    });
    
    res.status(201).json(newComment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateComment = async (req, res) => {
  try {
    // 1. Lấy studentId từ auth
    const studentId = req.user.userid; 
    const { content } = req.body;
    
    // 2. Gọi service (service của bạn đã có logic kiểm tra studentId, rất tốt!)
    const updatedComment = await commentService.updateComment(
      req.params.id, // commentId
      studentId,     // studentId (để xác thực)
      content        // Dữ liệu mới
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    // Service sẽ văng lỗi 'Unauthorized' nếu sai chủ
    if (error.message === 'Unauthorized' || error.message === 'Comment not found') {
      return res.status(403).json({ message: 'Không có quyền sửa bình luận này' });
    }
    handleError(res, error);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    // 1. Lấy studentId và userRole từ auth (Giả sử bạn lưu role trong token)
    const studentId = req.user.userid;
    const userRole = req.user.role; // Ví dụ: 'student', 'instructor'
    
    // 2. Gọi service (service của bạn đã có logic kiểm tra role, rất tốt!)
    await commentService.deleteComment(
      req.params.id, // commentId
      studentId,     // studentId (để xác thực)
      userRole       // userRole (để cho phép admin/instructor xóa)
    );
    
    res.status(204).send();
  } catch (error) {
    // Service sẽ văng lỗi 'Unauthorized'
    if (error.message === 'Unauthorized' || error.message === 'Comment not found') {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
    }
    handleError(res, error);
  }
};