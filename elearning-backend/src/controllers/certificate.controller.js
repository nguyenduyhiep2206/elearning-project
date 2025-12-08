const certificateService = require('../services/certificate.service');
const apiResponse = require('../utils/apiResponse');

class CertificateController {
  /**
   * Issue certificate cho sinh viên
   * POST /api/certificates/issue
   * Body: { courseId, studentId, studentWalletAddress }
   */
  async issueCertificate(req, res) {
    try {
      const { courseId, studentId, studentWalletAddress } = req.body;

      // Validate input
      if (!courseId || !studentId || !studentWalletAddress) {
        return apiResponse.error(
          res,
          'Missing required fields: courseId, studentId, and studentWalletAddress are required',
          400
        );
      }

      // Validate wallet address format (basic check)
      if (!/^0x[a-fA-F0-9]{40}$/.test(studentWalletAddress)) {
        return apiResponse.error(
          res,
          'Invalid wallet address format',
          400
        );
      }

      // Issue certificate
      const result = await certificateService.issueCertificate(
        parseInt(studentId),
        parseInt(courseId),
        studentWalletAddress
      );

      return apiResponse.success(
        res,
        {
          certificateId: result.certificate.certificateid,
          transactionHash: result.transactionHash,
          tokenId: result.tokenId,
          metadataUrl: result.metadataUrl
        },
        'Certificate issued successfully'
      );
    } catch (error) {
      console.error('Error in issueCertificate controller:', error);
      
      // Handle specific errors
      if (error.message.includes('not completed')) {
        return apiResponse.error(res, error.message, 400);
      }
      
      if (error.message.includes('already issued')) {
        return apiResponse.error(res, error.message, 409);
      }
      
      if (error.message.includes('not found')) {
        return apiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('Blockchain error') || error.message.includes('Insufficient funds')) {
        return apiResponse.error(res, error.message, 500);
      }

      return apiResponse.error(res, error.message || 'Failed to issue certificate', 500);
    }
  }

  /**
   * Lấy danh sách certificates của sinh viên
   * GET /api/certificates/student/:studentId
   */
  async getStudentCertificates(req, res) {
    try {
      const { studentId } = req.params;
      const userId = req.user.id || req.user.userid;
      const userRole = req.user.role?.toLowerCase();

      if (!studentId) {
        return apiResponse.error(res, 'Student ID is required', 400);
      }

      // User chỉ có thể xem chứng chỉ của chính mình (trừ admin)
      if (parseInt(studentId) !== parseInt(userId) && userRole !== 'admin') {
        return apiResponse.error(
          res,
          'Bạn không có quyền xem chứng chỉ của người dùng này.',
          403
        );
      }

      const certificates = await certificateService.getStudentCertificates(parseInt(studentId));

      return apiResponse.success(
        res,
        certificates,
        'Certificates retrieved successfully'
      );
    } catch (error) {
      console.error('Error in getStudentCertificates controller:', error);
      return apiResponse.error(res, error.message || 'Failed to get certificates', 500);
    }
  }

  /**
   * Lấy thông tin certificate theo ID
   * GET /api/certificates/:certificateId
   */
  async getCertificateById(req, res) {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        return apiResponse.error(res, 'Certificate ID is required', 400);
      }

      const certificate = await certificateService.getCertificateById(parseInt(certificateId));

      return apiResponse.success(
        res,
        certificate,
        'Certificate retrieved successfully'
      );
    } catch (error) {
      console.error('Error in getCertificateById controller:', error);
      
      if (error.message.includes('not found')) {
        return apiResponse.error(res, error.message, 404);
      }

      return apiResponse.error(res, error.message || 'Failed to get certificate', 500);
    }
  }

  /**
   * Lấy tất cả certificates (cho admin)
   * GET /api/certificates/all
   */
  async getAllCertificates(req, res) {
    try {
      const {
        studentId,
        courseId,
        search,
        page = 1,
        limit = 20,
        sortBy = 'issuedat',
        sortOrder = 'DESC'
      } = req.query;

      const result = await certificateService.getAllCertificates({
        studentId,
        courseId,
        search,
        page,
        limit,
        sortBy,
        sortOrder
      });

      return apiResponse.success(
        res,
        result,
        'Certificates retrieved successfully'
      );
    } catch (error) {
      console.error('Error in getAllCertificates controller:', error);
      return apiResponse.error(res, error.message || 'Failed to get certificates', 500);
    }
  }

  /**
   * Download PDF certificate
   * GET /api/certificates/:certificateId/download
   */
  async downloadPDFCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id || req.user.userid;
      const userRole = req.user.role?.toLowerCase();

      if (!certificateId) {
        return apiResponse.error(res, 'Certificate ID is required', 400);
      }

      // Lấy thông tin certificate
      const certificate = await certificateService.getCertificateById(parseInt(certificateId));

      if (!certificate) {
        return apiResponse.error(res, 'Certificate not found', 404);
      }

      // Kiểm tra quyền: user chỉ có thể download chứng chỉ của chính mình (trừ admin)
      if (certificate.studentid !== parseInt(userId) && userRole !== 'admin') {
        return apiResponse.error(
          res,
          'Bạn không có quyền tải xuống chứng chỉ này.',
          403
        );
      }

      // Tạo hoặc lấy PDF path
      const pdfPath = await certificateService.getPDFCertificatePath(parseInt(certificateId));

      // Set headers để download file
      const fileName = `ChungChi_${certificate.course?.coursename || 'KhoaHoc'}_${certificate.student?.fullname || 'HocVien'}.pdf`;
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);

      // Gửi file
      const path = require('path');
      const fs = require('fs');
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error in downloadPDFCertificate controller:', error);
      
      if (error.message.includes('not found')) {
        return apiResponse.error(res, error.message, 404);
      }

      return apiResponse.error(res, error.message || 'Failed to download certificate PDF', 500);
    }
  }

  /**
   * Học viên tự phát hành chứng chỉ của mình
   * POST /api/certificates/:certificateId/mint
   */
  async studentMintCertificate(req, res) {
    try {
      const { certificateId } = req.params;
      const userId = req.user.id || req.user.userid;

      if (!certificateId) {
        return apiResponse.error(res, 'Certificate ID is required', 400);
      }

      console.log('certificateId', req.params, userId);

      const result = await certificateService.studentMintCertificate(
        parseInt(certificateId),
        parseInt(userId)
      );

      return apiResponse.success(
        res,
        {
          certificateId: result.certificate.certificateid,
          transactionHash: result.transactionHash,
          tokenId: result.tokenId,
          metadataUrl: result.metadataUrl
        },
        'Certificate minted successfully'
      );
    } catch (error) {
      console.error('Error in studentMintCertificate controller:', error);
      
      if (error.message.includes('not found')) {
        return apiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('quyền')) {
        return apiResponse.error(res, error.message, 403);
      }
      
      if (error.message.includes('đã được phát hành')) {
        return apiResponse.error(res, error.message, 409);
      }
      
      if (error.message.includes('chưa cập nhật địa chỉ ví')) {
        return apiResponse.error(res, error.message, 400);
      }
      
      if (error.message.includes('Blockchain error')) {
        return apiResponse.error(res, error.message, 500);
      }

      return apiResponse.error(res, error.message || 'Failed to mint certificate', 500);
    }
  }
}

module.exports = new CertificateController();

