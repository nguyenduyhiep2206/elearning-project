const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/user.controller');
const { verifyToken, authorizeRoles } = require('../../middlewares/auth.middleware');
console.log({ verifyToken, authorizeRoles });

// router.get('/', verifyToken, authorizeRoles('admin'), UserController.getAll);
router.get('/',UserController.getAll);
router.get('/:id', verifyToken, authorizeRoles('admin', 'teacher'), UserController.getById);

router.put('/:id', verifyToken, authorizeRoles('admin', 'teacher'), UserController.update);

router.delete('/:id', verifyToken, authorizeRoles('admin'), UserController.delete);

module.exports = router;

