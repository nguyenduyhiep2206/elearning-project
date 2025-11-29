const certificateService = require('../services/certificate.service');
const apiResponse = require('../utils/apiResponse');

class CertificateController {
  /**
   * Issue certificate cho sinh viên
   * POST /api/certificates/issue
   * Body: { courseId, studentId, walletAddress }
   */
  async issueCertificate(req, res) {
    try {
      const { courseId, studentId, walletAddress } = req.body;

      // Validate input
      if (!courseId || !studentId || !walletAddress) {
        return apiResponse.validationError(res, {
          courseId: courseId ? undefined : 'CourseID là bắt buộc',
          studentId: studentId ? undefined : 'StudentID là bắt buộc',
          walletAddress: walletAddress ? undefined : 'WalletAddress là bắt buộc'
        }, 'Thiếu thông tin bắt buộc');
      }

      // Validate wallet address format (basic check)
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return apiResponse.validationError(res, {
          walletAddress: 'Địa chỉ ví không hợp lệ. Phải là địa chỉ Ethereum hợp lệ (0x...)'
        }, 'Địa chỉ ví không hợp lệ');
      }

      // Issue certificate
      const certificate = await certificateService.issueCertificate(
        parseInt(studentId),
        parseInt(courseId),
        walletAddress
      );

      return apiResponse.success(
        res,
        certificate,
        'Chứng chỉ đã được cấp và mint lên blockchain thành công',
        201
      );
    } catch (error) {
      console.error('Lỗi trong issueCertificate controller:', error);
      
      // Xử lý các lỗi cụ thể
      if (error.message.includes('chưa hoàn thành')) {
        return apiResponse.error(res, error.message, 400);
      }

      if (error.message.includes('đã được cấp')) {
        return apiResponse.error(res, error.message, 409);
      }

      if (error.message.includes('ví không hợp lệ') || error.message.includes('địa chỉ')) {
        return apiResponse.error(res, error.message, 400);
      }

      if (error.message.includes('blockchain') || error.message.includes('smart contract')) {
        return apiResponse.error(res, error.message, 500);
      }

      return apiResponse.error(res, error.message || 'Lỗi khi cấp chứng chỉ', 500);
    }
  }

  /**
   * Lấy danh sách certificates của sinh viên
   * GET /api/certificates/student/:studentId
   */
  async getCertificatesByStudent(req, res) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return apiResponse.validationError(res, {
          studentId: 'StudentID là bắt buộc'
        }, 'Thiếu thông tin bắt buộc');
      }

      const certificates = await certificateService.getCertificatesByStudent(parseInt(studentId));

      return apiResponse.success(
        res,
        certificates,
        'Lấy danh sách chứng chỉ thành công'
      );
    } catch (error) {
      console.error('Lỗi trong getCertificatesByStudent controller:', error);
      return apiResponse.error(res, error.message || 'Lỗi khi lấy danh sách chứng chỉ', 500);
    }
  }

  /**
   * Lấy thông tin certificate theo ID (public endpoint)
   * GET /api/certificates/:certificateId
   */
  async getCertificateById(req, res) {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        return apiResponse.validationError(res, {
          certificateId: 'CertificateID là bắt buộc'
        }, 'Thiếu thông tin bắt buộc');
      }

      const certificate = await certificateService.getCertificateById(parseInt(certificateId));

      return apiResponse.success(
        res,
        certificate,
        'Lấy thông tin chứng chỉ thành công'
      );
    } catch (error) {
      console.error('Lỗi trong getCertificateById controller:', error);
      
      if (error.message.includes('Không tìm thấy')) {
        return apiResponse.notFound(res, error.message);
      }

      return apiResponse.error(res, error.message || 'Lỗi khi lấy thông tin chứng chỉ', 500);
    }
  }
}

module.exports = new CertificateController();

