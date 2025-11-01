const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Đăng nhập người dùng
 * @access  Public
 */
router.post('/login', authController.login);


/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký người dùng mới
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Đăng xuất người dùng
 * @access  Private
 */
router.post('/logout', authMiddleware.verifyToken, authController.logout);

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Xác thực token và lấy thông tin user
 * @access  Private
 */
router.get('/verify', authMiddleware.verifyToken, authController.verifyAuth);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', authMiddleware.verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Thông tin user hiện tại',
        data: {
            user: req.user
        }
    });
});

module.exports = router;
