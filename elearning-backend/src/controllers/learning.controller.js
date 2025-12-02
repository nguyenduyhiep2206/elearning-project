const learningService = require('../services/learning.service');
const ApiResponse = require('../utils/apiResponse');

class LearningController {
  /**
   * Lấy thông tin khóa học với chapters và lessons
   */
  async getCourseContent(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { courseId } = req.params;

      const data = await learningService.getCourseContent(userId, parseInt(courseId));
      return ApiResponse.success(res, data, 'Lấy thông tin khóa học thành công');
    } catch (error) {
      console.error('Error in getCourseContent:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Lấy thông tin lesson cụ thể
   */
  async getLesson(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { lessonId } = req.params;

      const data = await learningService.getLesson(userId, parseInt(lessonId));
      return ApiResponse.success(res, data, 'Lấy thông tin bài học thành công');
    } catch (error) {
      console.error('Error in getLesson:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Cập nhật tiến độ học
   */
  async updateProgress(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { lessonId } = req.params;
      const { isCompleted } = req.body;

      const data = await learningService.updateProgress(
        userId,
        parseInt(lessonId),
        isCompleted !== undefined ? isCompleted : true
      );
      return ApiResponse.success(res, data, 'Cập nhật tiến độ thành công');
    } catch (error) {
      console.error('Error in updateProgress:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Lấy danh sách khóa học đã đăng ký
   */
  async getMyCourses(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { page = 1, limit = 10 } = req.query;

      const data = await learningService.getMyCourses(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      return ApiResponse.success(res, data, 'Lấy danh sách khóa học đã đăng ký thành công');
    } catch (error) {
      console.error('Error in getMyCourses:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy danh sách quiz của một lesson
   */
  async getQuizzesByLesson(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { lessonId } = req.params;

      const data = await learningService.getQuizzesByLesson(userId, parseInt(lessonId));
      return ApiResponse.success(res, data, 'Lấy danh sách quiz thành công');
    } catch (error) {
      console.error('Error in getQuizzesByLesson:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Bắt đầu làm quiz
   */
  async startQuiz(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { quizId } = req.params;

      const data = await learningService.startQuiz(userId, parseInt(quizId));
      return ApiResponse.success(res, data, 'Bắt đầu làm quiz thành công');
    } catch (error) {
      console.error('Error in startQuiz:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Lấy session hiện tại
   */
  async getCurrentSession(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { quizId } = req.params;

      const data = await learningService.getCurrentSession(userId, parseInt(quizId));
      if (!data) {
        return ApiResponse.error(res, 'Không tìm thấy session đang làm', 404);
      }
      return ApiResponse.success(res, data, 'Lấy session thành công');
    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Nộp câu trả lời
   */
  async submitAnswer(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { sessionId } = req.params;
      const { questionId, selectedOptionId } = req.body;

      const data = await learningService.submitAnswer(
        userId,
        parseInt(sessionId),
        parseInt(questionId),
        parseInt(selectedOptionId)
      );
      return ApiResponse.success(res, data, 'Nộp câu trả lời thành công');
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Nộp bài quiz
   */
  async submitQuiz(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { sessionId } = req.params;

      const data = await learningService.submitQuiz(userId, parseInt(sessionId));
      return ApiResponse.success(res, data, 'Nộp bài quiz thành công');
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  /**
   * Lấy kết quả quiz
   */
  async getQuizResult(req, res) {
    try {
      const userId = req.user.id || req.user.userid;
      const { quizId } = req.params;

      const data = await learningService.getQuizResult(userId, parseInt(quizId));
      return ApiResponse.success(res, data, 'Lấy kết quả quiz thành công');
    } catch (error) {
      console.error('Error in getQuizResult:', error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new LearningController();

