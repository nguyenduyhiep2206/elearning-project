const enrollmentService = require('../services/enrollment.service');
const apiResponse = require('../utils/apiResponse');

class EnrollmentController {
  // [POST] /api/v1/enrollments
  async createEnrollment(req, res) {
    try {
      const studentId = req.user.userid; // Lấy từ authMiddleware
      const { courseId } = req.body;

      if (!courseId) {
        return apiResponse.error(res, 'Thiếu thông tin courseId', 400);
      }

      const newEnrollment = await enrollmentService.createEnrollment(
        studentId,
        courseId
      );

      return apiResponse.success(
        res,
        newEnrollment,
        'Đăng ký khóa học thành công',
        201
      );
    } catch (error) {
      if (error.message.includes('Bạn đã đăng ký')) {
        return apiResponse.error(res, error.message, 409); // 409 Conflict
      }
      return apiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new EnrollmentController();