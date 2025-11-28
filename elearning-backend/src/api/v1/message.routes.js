const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/message.controller");
const { verifyToken } = require('../../middlewares/auth.middleware');

router.post("/", verifyToken, messageController.sendMessage);

router.get("/:userId", verifyToken, messageController.getMessages);

router.get("/", verifyToken, messageController.getChatUsers);

router.post("/seen", verifyToken, messageController.markMessagesAsSeen);

module.exports = router;
