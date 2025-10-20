const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middlewares/auth.middleware'); // Import auth
const authorizeRole = require('../../middlewares/role.middleware');
router.get('/all', authMiddleware, authorizeRole(['Admin']), userController.getAllUsers);
router.post('/', authMiddleware, authorizeRole(['Admin']), userController.createUser);
router.put('/:id', authMiddleware, authorizeRole(['Admin']), userController.updateUser);
router.delete('/:id', authMiddleware, authorizeRole(['Admin']), userController.deleteUser);
router.post('/profile-image', authMiddleware, userController.uploadProfileImage);
router.get('/users/:id/details', authMiddleware,authorizeRole(['Admin']), userController.getUserDetails);
router.put('/users/:id/approve-teacher', authMiddleware, authorizeRole(['Admin']), userController.approveTeacherRequest); 

module.exports = router;


