const teacherService = require('../services/teacher.service');
const ApiResponse = require('../utils/apiResponse');

class TeacherController {
  /**
   * Lấy thống kê của teacher
   * @route GET /api/v1/teacher/stats
   * @access Private (Teacher only)
   */
  async getStats(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const stats = await teacherService.getStats(teacherId);
      return ApiResponse.success(res, stats, 'Lấy thống kê thành công');
    } catch (error) {
      console.error('Error in getStats controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy danh sách khóa học của teacher
   * @route GET /api/v1/teacher/courses
   * @access Private (Teacher only)
   */
  async getMyCourses(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const { page = 1, limit = 10, status } = req.query;
      const result = await teacherService.getMyCourses(teacherId, { page, limit, status });
      return ApiResponse.success(res, result, 'Lấy danh sách khóa học thành công');
    } catch (error) {
      console.error('Error in getMyCourses controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy chi tiết khóa học của teacher
   * @route GET /api/v1/teacher/courses/:id
   * @access Private (Teacher only)
   */
  async getCourseById(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseId = req.params.id;
      const course = await teacherService.getCourseById(teacherId, courseId);
      return ApiResponse.success(res, course, 'Lấy chi tiết khóa học thành công');
    } catch (error) {
      console.error('Error in getCourseById controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Tạo khóa học mới
   * @route POST /api/v1/teacher/courses
   * @access Private (Teacher only)
   */
  async createCourse(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseData = req.body;
      const course = await teacherService.createCourse(teacherId, courseData);
      return ApiResponse.success(res, course, 'Tạo khóa học thành công', 201);
    } catch (error) {
      console.error('Error in createCourse controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Cập nhật khóa học
   * @route PUT /api/v1/teacher/courses/:id
   * @access Private (Teacher only)
   */
  async updateCourse(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseId = req.params.id;
      const courseData = req.body;
      const course = await teacherService.updateCourse(teacherId, courseId, courseData);
      return ApiResponse.success(res, course, 'Cập nhật khóa học thành công');
    } catch (error) {
      console.error('Error in updateCourse controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Xóa khóa học
   * @route DELETE /api/v1/teacher/courses/:id
   * @access Private (Teacher only)
   */
  async deleteCourse(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseId = req.params.id;
      await teacherService.deleteCourse(teacherId, courseId);
      return ApiResponse.success(res, null, 'Xóa khóa học thành công');
    } catch (error) {
      console.error('Error in deleteCourse controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Lấy danh sách học viên đã đăng ký khóa học
   * @route GET /api/v1/teacher/students
   * @access Private (Teacher only)
   */
  async getStudents(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const { page = 1, limit = 10, courseId, search } = req.query;
      const result = await teacherService.getStudents(teacherId, { page, limit, courseId, search });
      return ApiResponse.success(res, result, 'Lấy danh sách học viên thành công');
    } catch (error) {
      console.error('Error in getStudents controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy danh sách chapters của khóa học
   * @route GET /api/v1/teacher/courses/:courseId/chapters
   * @access Private (Teacher only)
   */
  async getChapters(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseId = req.params.courseId;
      const chapters = await teacherService.getChapters(teacherId, courseId);
      return ApiResponse.success(res, chapters, 'Lấy danh sách chapters thành công');
    } catch (error) {
      console.error('Error in getChapters controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Tạo chapter mới
   * @route POST /api/v1/teacher/courses/:courseId/chapters
   * @access Private (Teacher only)
   */
  async createChapter(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const courseId = req.params.courseId;
      const chapterData = req.body;
      const chapter = await teacherService.createChapter(teacherId, courseId, chapterData);
      return ApiResponse.success(res, chapter, 'Tạo chapter thành công', 201);
    } catch (error) {
      console.error('Error in createChapter controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Cập nhật chapter
   * @route PUT /api/v1/teacher/chapters/:chapterId
   * @access Private (Teacher only)
   */
  async updateChapter(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const chapterId = req.params.chapterId;
      const chapterData = req.body;
      const chapter = await teacherService.updateChapter(teacherId, chapterId, chapterData);
      return ApiResponse.success(res, chapter, 'Cập nhật chapter thành công');
    } catch (error) {
      console.error('Error in updateChapter controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Xóa chapter
   * @route DELETE /api/v1/teacher/chapters/:chapterId
   * @access Private (Teacher only)
   */
  async deleteChapter(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const chapterId = req.params.chapterId;
      await teacherService.deleteChapter(teacherId, chapterId);
      return ApiResponse.success(res, null, 'Xóa chapter thành công');
    } catch (error) {
      console.error('Error in deleteChapter controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Lấy danh sách lessons của chapter
   * @route GET /api/v1/teacher/chapters/:chapterId/lessons
   * @access Private (Teacher only)
   */
  async getLessons(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const chapterId = req.params.chapterId;
      const lessons = await teacherService.getLessons(teacherId, chapterId);
      return ApiResponse.success(res, lessons, 'Lấy danh sách lessons thành công');
    } catch (error) {
      console.error('Error in getLessons controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Tạo lesson mới
   * @route POST /api/v1/teacher/chapters/:chapterId/lessons
   * @access Private (Teacher only)
   */
  async createLesson(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const chapterId = req.params.chapterId;
      const lessonData = req.body;
      const lesson = await teacherService.createLesson(teacherId, chapterId, lessonData);
      return ApiResponse.success(res, lesson, 'Tạo lesson thành công', 201);
    } catch (error) {
      console.error('Error in createLesson controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Cập nhật lesson
   * @route PUT /api/v1/teacher/lessons/:lessonId
   * @access Private (Teacher only)
   */
  async updateLesson(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const lessonId = req.params.lessonId;
      const lessonData = req.body;
      const lesson = await teacherService.updateLesson(teacherId, lessonId, lessonData);
      return ApiResponse.success(res, lesson, 'Cập nhật lesson thành công');
    } catch (error) {
      console.error('Error in updateLesson controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }

  /**
   * Xóa lesson
   * @route DELETE /api/v1/teacher/lessons/:lessonId
   * @access Private (Teacher only)
   */
  async deleteLesson(req, res) {
    try {
      const teacherId = req.user.id || req.user.userid;
      const lessonId = req.params.lessonId;
      await teacherService.deleteLesson(teacherId, lessonId);
      return ApiResponse.success(res, null, 'Xóa lesson thành công');
    } catch (error) {
      console.error('Error in deleteLesson controller:', error);
      return ApiResponse.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new TeacherController();

