const cloudinaryService = require('../services/cloudinary.service');
const learningService = require('../services/learning.service');
const ApiResponse = require('../utils/apiResponse');

class CloudinaryController {
  /**
   * Lấy signed upload signature cho giảng viên
   * POST /cloudinary/upload-signature
   */
  async getUploadSignature(req, res) {
    try {
      const { folder, resourceType } = req.body;
      
      const signature = cloudinaryService.generateUploadSignature({
        folder: folder || 'elearning/videos',
        resourceType: resourceType || 'video',
      });

      return ApiResponse.success(res, signature, 'Lấy upload signature thành công');
    } catch (error) {
      console.error('Error in getUploadSignature:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy signed view URL cho học viên
   * GET /cloudinary/view-url/:lessonId
   */
  async getViewUrl(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { lessonId } = req.params;
      const { expiresIn } = req.query;

      // Kiểm tra enrollment thông qua learning service
      const lesson = await require('../models').lessons.findByPk(lessonId, {
        include: [
          {
            model: require('../models').chapters,
            as: 'chapter',
            include: [
              {
                model: require('../models').courses,
                as: 'course',
                attributes: ['courseid'],
              },
            ],
          },
        ],
      });

      if (!lesson) {
        return ApiResponse.error(res, 'Không tìm thấy bài học', 404);
      }

      // Kiểm tra enrollment
      const isEnrolled = await learningService.checkEnrollment(
        userId,
        lesson.chapter.course.courseid
      );

      if (!isEnrolled) {
        return ApiResponse.error(res, 'Bạn chưa đăng ký khóa học này', 403);
      }

      // Lấy signed URL
      const result = await cloudinaryService.getLessonViewUrl(
        parseInt(lessonId),
        userId,
        {
          expiresIn: expiresIn ? parseInt(expiresIn) : 3600,
        }
      );

      return ApiResponse.success(res, result, 'Lấy signed URL thành công');
    } catch (error) {
      console.error('Error in getViewUrl:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new CloudinaryController();
