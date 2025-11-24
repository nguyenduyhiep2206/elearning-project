const express = require('express');
const router = express.Router();
const controller = require('../../controllers/forum.controller');
const auth = require('../../middlewares/auth.middleware');

router.use(auth.verifyToken);
router.post('/', controller.createReply);
router.delete('/:id', controller.deleteReply);

module.exports = router;