const teacherRequestService = require('../services/teacherRequest.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller xử lý các yêu cầu trở thành giảng viên
 */
class TeacherRequestController {
  /**
   * Tạo yêu cầu trở thành giảng viên
   * POST /teacher-requests
   */
  async submitRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { bio, teachingField, cvUrl, certificateUrls, idCardUrl } = req.body;

      // Validation
      if (!bio || !teachingField) {
        return ApiResponse.error(res, 'Vui lòng điền đầy đủ thông tin', 400);
      }

      if (!cvUrl || !idCardUrl) {
        return ApiResponse.error(res, 'Vui lòng upload CV và CCCD', 400);
      }

      const request = await teacherRequestService.submitRequest(userId, {
        bio,
        teachingField,
        cvUrl,
        certificateUrls: certificateUrls || [],
        idCardUrl
      });

      return ApiResponse.success(
        res,
        request,
        'Gửi yêu cầu thành công. Vui lòng chờ duyệt.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy tất cả yêu cầu (chỉ admin)
   * GET /teacher-requests
   */
  async getAllRequests(req, res, next) {
    try {
      const { status } = req.query;
      const requests = await teacherRequestService.getAllRequests({ status });
      return ApiResponse.success(res, requests, 'Lấy danh sách yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy yêu cầu theo ID
   * GET /teacher-requests/:id
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await teacherRequestService.getRequestById(id);
      return ApiResponse.success(res, request, 'Lấy thông tin yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy yêu cầu của user hiện tại
   * GET /teacher-requests/my-request
   */
  async getMyRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const request = await teacherRequestService.getMyRequest(userId);
      
      if (!request) {
        return ApiResponse.success(res, null, 'Bạn chưa có yêu cầu nào');
      }

      return ApiResponse.success(res, request, 'Lấy thông tin yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duyệt yêu cầu (chỉ admin)
   * POST /teacher-requests/:id/approve
   */
  async approveRequest(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const request = await teacherRequestService.approveRequest(id, adminId);
      return ApiResponse.success(res, request, 'Duyệt yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Từ chối yêu cầu (chỉ admin)
   * POST /teacher-requests/:id/reject
   */
  async rejectRequest(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const { rejectionReason } = req.body;

      if (!rejectionReason || rejectionReason.trim() === '') {
        return ApiResponse.error(res, 'Vui lòng nhập lý do từ chối', 400);
      }

      const request = await teacherRequestService.rejectRequest(id, adminId, rejectionReason);
      return ApiResponse.success(res, request, 'Từ chối yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy số lượng yêu cầu đang chờ duyệt (chỉ admin)
   * GET /teacher-requests/pending/count
   */
  async getPendingCount(req, res, next) {
    try {
      const count = await teacherRequestService.getPendingCount();
      return ApiResponse.success(res, { count }, 'Lấy số lượng yêu cầu thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherRequestController();

