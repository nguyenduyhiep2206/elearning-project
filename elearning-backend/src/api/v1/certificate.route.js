const express = require('express');
const router = express.Router();
const certificateController = require('../../controllers/certificate.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

// POST /api/v1/certificates/issue - Issue certificate (chỉ Admin)
router.post(
  '/issue',
  verifyToken,
  requireAdmin,
  certificateController.issueCertificate.bind(certificateController)
);

// GET /api/v1/certificates/student/:studentId - Lấy certificates của sinh viên (user chỉ xem được của chính mình)
router.get(
  '/student/:studentId',
  verifyToken,
  certificateController.getStudentCertificates.bind(certificateController)
);

// GET /api/v1/certificates/my-certificates - Lấy certificates của user hiện tại (tiện lợi hơn)
router.get(
  '/my-certificates',
  verifyToken,
  (req, res, next) => {
    // Tự động set studentId = userId của user hiện tại
    req.params.studentId = req.user.id || req.user.userid;
    certificateController.getStudentCertificates(req, res, next);
  }
);

// POST /api/v1/certificates/:certificateId/mint - Học viên tự phát hành chứng chỉ (đặt trước /:certificateId)
router.post(
  '/:certificateId/mint',
  verifyToken,
  certificateController.studentMintCertificate.bind(certificateController)
);

// GET /api/v1/certificates/:certificateId/download - Download PDF certificate (đặt trước /:certificateId)
router.get(
  '/:certificateId/download',
  verifyToken,
  certificateController.downloadPDFCertificate.bind(certificateController)
);

// GET /api/v1/certificates/:certificateId - Lấy thông tin certificate theo ID (đặt cuối cùng)
router.get(
  '/:certificateId',
  verifyToken,
  certificateController.getCertificateById.bind(certificateController)
);

module.exports = router;

