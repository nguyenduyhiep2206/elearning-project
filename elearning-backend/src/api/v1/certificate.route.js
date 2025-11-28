const express = require('express');
const router = express.Router();
const certificateController = require('../../controllers/certificate.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

// Route để issue certificate (chỉ admin mới được phép)
router.post(
  '/issue',
  verifyToken,
  requireAdmin,
  certificateController.issueCertificate
);

// Route để lấy danh sách certificates của sinh viên
router.get(
  '/student/:studentId',
  verifyToken,
  certificateController.getCertificatesByStudent
);

// Route public để lấy thông tin certificate theo ID (cho verify page)
router.get(
  '/:certificateId',
  certificateController.getCertificateById
);

module.exports = router;

