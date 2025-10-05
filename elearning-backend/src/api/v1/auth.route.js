// const express = require('express');
// const router = express.Router();
// const authController = require('../../controllers/auth.controller');

// router.post('/login', authController.login);
// // ... các routes khác

// module.exports = router;
const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/auth.controller');
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
module.exports = router;
