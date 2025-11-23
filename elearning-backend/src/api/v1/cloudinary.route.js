const express = require('express');
const router = express.Router();
const cloudinaryController = require('../../controllers/cloudinary.controller');
const { verifyToken, requireAuth, requireInstructor } = require('../../middlewares/auth.middleware');

// Lấy signed upload signature (chỉ giảng viên)
router.post(
  '/upload-signature',
  verifyToken,
  requireAuth,
  requireInstructor,
  cloudinaryController.getUploadSignature
);

// Lấy signed view URL (học viên đã đăng ký)
router.get(
  '/view-url/:lessonId',
  verifyToken,
  requireAuth,
  cloudinaryController.getViewUrl
);

module.exports = router;
