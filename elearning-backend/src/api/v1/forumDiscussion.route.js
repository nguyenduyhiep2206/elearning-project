const express = require('express');
const router = express.Router();
const controller = require('../../controllers/forum.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/course/:courseId', controller.getDiscussionsByCourse);
router.get('/:id', controller.getDiscussionById);

router.use(auth.verifyToken);
router.post('/', controller.createDiscussion);

module.exports = router;