const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../../controllers/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');


router.post('/login', authController.login);


router.post('/register', authController.register);


router.post('/logout', authMiddleware.verifyToken, authController.logout);


router.get('/verify', authMiddleware.verifyToken, authController.verifyAuth);

router.get('/me', authMiddleware.verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Thông tin user hiện tại',
        data: {
            user: req.user
        }
    });
});
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

// router.get('/facebook',
//     passport.authenticate('facebook', { scope: ['email'] })
// );

// router.get('/facebook/callback',
//     passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
//     authController.facebookCallback
// );

module.exports = router;
