const courseService = require('../services/course.service');
const apiResponse = require('../utils/apiResponse');

class CourseController {
  // Lấy tất cả khóa học
  async getAllCourses(req, res) {
    try {
      const { page = 1, limit = 10, search = '', categoryId } = req.query;
      
      const result = await courseService.getAllCourses(page, limit, search, categoryId);
      
      return apiResponse.success(res, result, 'Lấy danh sách khóa học thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Lấy khóa học theo ID
  async getCourseById(req, res) {
    try {
      const { courseId } = req.params;
      
      const course = await courseService.getCourseById(courseId);
      
      return apiResponse.success(res, course, 'Lấy thông tin khóa học thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }
  
  // Tạo khóa học mới
  async createCourse(req, res) {
    try {
      const courseData = req.body;
      const teacherId = req.user.userid; // Lấy từ middleware auth
      
      // Validate dữ liệu đầu vào
      if (!courseData.coursename || !courseData.description || !courseData.price) {
        return apiResponse.error(res, 'Thiếu thông tin bắt buộc', 400);
      }
      
      const newCourse = await courseService.createCourse(courseData, teacherId);
      
      return apiResponse.success(res, newCourse, 'Tạo khóa học thành công', 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Cập nhật khóa học
  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const courseData = req.body;
      const teacherId = req.user.userid;
      
      const updatedCourse = await courseService.updateCourse(courseId, courseData, teacherId);
      
      return apiResponse.success(res, updatedCourse, 'Cập nhật khóa học thành công');
    } catch (error) {
      if (error.message.includes('Không tìm thấy')) {
        return apiResponse.error(res, error.message, 404);
      }
      if (error.message.includes('không có quyền')) {
        return apiResponse.error(res, error.message, 403);
      }
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Xóa khóa học
  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.userid;
      
      const result = await courseService.deleteCourse(courseId, teacherId);
      
      return apiResponse.success(res, result, 'Xóa khóa học thành công');
    } catch (error) {
      if (error.message.includes('Không tìm thấy')) {
        return apiResponse.error(res, error.message, 404);
      }
      if (error.message.includes('không có quyền')) {
        return apiResponse.error(res, error.message, 403);
      }
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Lấy khóa học theo instructor
  async getCoursesByInstructor(req, res) {
    try {
      const { instructorId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await courseService.getCoursesByInstructor(instructorId, page, limit);
      
      return apiResponse.success(res, result, 'Lấy khóa học của instructor thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Lấy khóa học phổ biến
  async getPopularCourses(req, res) {
    try {
      const { limit = 8 } = req.query;
      
      const popularCourses = await courseService.getPopularCourses(limit);
      
      return apiResponse.success(res, popularCourses, 'Lấy khóa học phổ biến thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Lấy khóa học mới nhất
  async getLatestCourses(req, res) {
    try {
      const { limit = 8 } = req.query;
      
      const latestCourses = await courseService.getLatestCourses(limit);
      
      return apiResponse.success(res, latestCourses, 'Lấy khóa học mới nhất thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Tìm kiếm khóa học
  async searchCourses(req, res) {
    try {
      const { q: query, page = 1, limit = 10 } = req.query;
      
      if (!query) {
        return apiResponse.error(res, 'Vui lòng nhập từ khóa tìm kiếm', 400);
      }
      
      const result = await courseService.searchCourses(query, page, limit);
      
      return apiResponse.success(res, result, 'Tìm kiếm khóa học thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
  
  // Lấy khóa học của tôi (instructor)
  async getMyCourses(req, res) {
    try {
      const teacherId = req.user.userid;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await courseService.getCoursesByInstructor(instructorId, page, limit);
      
      return apiResponse.success(res, result, 'Lấy khóa học của tôi thành công');
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new CourseController();
