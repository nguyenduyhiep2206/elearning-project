// controllers/forumDiscussion.controller.js

const discussionService = require('../services/forumDiscussion.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getDiscussionsByCourse = async (req, res) => {
  try {
    const discussions = await discussionService.getDiscussionsByCourse(req.params.courseId);
    res.status(200).json(discussions);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await discussionService.getDiscussionById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    res.status(200).json(discussion);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const newDiscussion = await discussionService.createDiscussion({ ...req.body, createdby: userId });
    
    // Tạm thời
    const newDiscussion = await discussionService.createDiscussion(req.body); // { courseid, title, createdby }
    
    res.status(201).json(newDiscussion);
  } catch (error) {
    handleError(res, error);
  }
};