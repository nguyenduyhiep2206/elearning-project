// controllers/forumReply.controller.js

const replyService = require('../services/forumReply.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.createReply = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const newReply = await replyService.createReply({ ...req.body, userid: userId });
    
    // Tạm thời
    const newReply = await replyService.createReply(req.body); // { discussionid, userid, content }
    
    res.status(201).json(newReply);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteReply = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const userRole = req.user.role;
    
    // Tạm thời
    const { userId, userRole } = req.body;
    
    await replyService.deleteReply(req.params.id, userId, userRole);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};