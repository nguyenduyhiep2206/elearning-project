const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');

router.post('/login', authController.login);
// ... các routes khác

module.exports = router;