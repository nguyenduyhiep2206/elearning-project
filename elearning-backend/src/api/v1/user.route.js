const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const authorizeRole = require('../../middlewares/role.middleware');

router.get('/all', verifyToken, authorizeRole(['Admin']), userController.getAllUsers);
router.post('/', verifyToken, authorizeRole(['Admin']), userController.createUser);
// Cập nhật wallet address (user chỉ có thể cập nhật của chính mình) - đặt trước route /:id để tránh conflict
router.put('/wallet', verifyToken, userController.updateWalletAddress);
// Lấy thông tin user theo ID (user có thể xem thông tin của chính mình)
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, authorizeRole(['Admin']), userController.updateUser);
router.delete('/:id', verifyToken, authorizeRole(['Admin']), userController.deleteUser);
router.post('/profile-image', verifyToken, userController.uploadProfileImage);
router.get('/users/:id/details', verifyToken,authorizeRole(['Admin']), userController.getUserDetails);
router.put('/users/:id/approve-teacher', verifyToken, authorizeRole(['Admin']), userController.approveTeacherRequest);

module.exports = router;


