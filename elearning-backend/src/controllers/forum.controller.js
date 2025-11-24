// src/controllers/forum.controller.js
const forumService = require('../services/forum.service');

// --- DISCUSSIONS ---
exports.createDiscussion = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { courseid, title } = req.body;
        const newDiscuss = await forumService.createDiscussion({ courseid, title, createdby: userId });
        res.status(201).json(newDiscuss);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDiscussionsByCourse = async (req, res) => {
    try {
        const list = await forumService.getDiscussionsByCourse(req.params.courseId);
        res.status(200).json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDiscussionById = async (req, res) => {
    try {
        const item = await forumService.getDiscussionById(req.params.id);
        if(!item) return res.status(404).json({message: 'Not found'});
        res.status(200).json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- REPLIES ---
exports.createReply = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { discussionid, content } = req.body;
        const newReply = await forumService.createReply({ discussionid, content, userid: userId });
        res.status(201).json(newReply);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteReply = async (req, res) => {
    try {
        const userId = req.user.userid;
        const role = req.user.role;
        await forumService.deleteReply(req.params.id, userId, role);
        res.status(204).send();
    } catch (err) { res.status(500).json({ message: err.message }); }
};