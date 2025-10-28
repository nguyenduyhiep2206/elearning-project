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
    // Giả sử studentId lấy từ auth middleware
    // const studentId = req.user.id; 
    // const newComment = await commentService.createComment({ ...req.body, studentid: studentId });
    
    // Tạm thời (chưa có auth):
    const newComment = await commentService.createComment(req.body); // Body cần có { lessonid, studentid, content }
    
    res.status(201).json(newComment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateComment = async (req, res) => {
  try {
    // const studentId = req.user.id; // Lấy từ auth
    const { content } = req.body;
    
    // Tạm thời (chưa có auth)
    const { studentId } = req.body; // Cần studentId để xác thực
    
    const updatedComment = await commentService.updateComment(req.params.id, studentId, content);
    res.status(200).json(updatedComment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    // const studentId = req.user.id;
    // const userRole = req.user.role;

    // Tạm thời (chưa có auth)
    const { studentId, userRole } = req.body; // Cần 2 cái này để xác thực

    await commentService.deleteComment(req.params.id, studentId, userRole);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};