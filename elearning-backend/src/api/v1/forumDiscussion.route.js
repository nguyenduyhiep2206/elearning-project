// api/routes/forumDiscussion.routes.js

const express = require('express');
const router = express.Router();
const discussionController = require('../../controllers/forumDiscussion.controller');
// const authMiddleware = require('../../middlewares/auth');

router.get('/course/:courseId', discussionController.getDiscussionsByCourse);
router.get('/:id', discussionController.getDiscussionById);
// router.post('/', authMiddleware, discussionController.createDiscussion);
router.post('/', discussionController.createDiscussion); // Tạm thời

module.exports = router;