const { courses, categories, users, coursereviews } = require('../models');
const { Op } = require('sequelize');

class CourseService {
  // Lấy tất cả khóa học với phân trang và tìm kiếm
  async getAllCourses(page = 1, limit = 10, search = '', categoryId = null) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      // Tìm kiếm theo tên khóa học
      if (search) {
        whereClause.coursename = {
          [Op.iLike]: `%${search}%`
        };
      }
      
      // Lọc theo danh mục
      if (categoryId) {
        whereClause.categoryid = categoryId;
      }
      
      const { count, rows } = await courses.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdat', 'DESC']]
      });
      
      return {
        courses: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      throw new Error(`Lỗi khi lấy danh sách khóa học: ${error.message}`);
    }
  }
  
  // Lấy khóa học theo ID
  async getCourseById(courseId) {
    try {
      const course = await courses.findByPk(courseId, {
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname', 'email']
          }
        ]
      });
      
      if (!course) {
        throw new Error('Không tìm thấy khóa học');
      }
      
      return course;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw new Error(`Lỗi khi lấy khóa học: ${error.message}`);
    }
  }
  
  // Tạo khóa học mới
  async createCourse(courseData, teacherId) {
    try {
      const newCourse = await courses.create({
        ...courseData,
        instructorid: teacherId,
        createdat: new Date(),
        updatedat: new Date()
      });
      
      return newCourse;
    } catch (error) {
      console.error('Error in createCourse:', error);
      throw new Error(`Lỗi khi tạo khóa học: ${error.message}`);
    }
  }
  
  // Cập nhật khóa học
  async updateCourse(courseId, courseData, teacherId) {
    try {
      const course = await courses.findByPk(courseId);
      
      if (!course) {
        throw new Error('Không tìm thấy khóa học');
      }
      
      // Kiểm tra quyền sở hữu (chỉ instructor tạo khóa học mới được sửa)
      if (course.instructorid !== teacherId) {
        throw new Error('Bạn không có quyền sửa khóa học này');
      }
      
      await course.update({
        ...courseData,
        updatedat: new Date()
      });
      
      return course;
    } catch (error) {
      console.error('Error in updateCourse:', error);
      throw new Error(`Lỗi khi cập nhật khóa học: ${error.message}`);
    }
  }
  
  // Xóa khóa học
  async deleteCourse(courseId, teacherId) {
    try {
      const course = await courses.findByPk(courseId);
      
      if (!course) {
        throw new Error('Không tìm thấy khóa học');
      }
      
      // Kiểm tra quyền sở hữu
      if (course.instructorid !== teacherId) {
        throw new Error('Bạn không có quyền xóa khóa học này');
      }
      
      await course.destroy();
      
      return { message: 'Xóa khóa học thành công' };
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      throw new Error(`Lỗi khi xóa khóa học: ${error.message}`);
    }
  }
  
  // Lấy khóa học theo instructor
  async getCoursesByInstructor(teacherId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await courses.findAndCountAll({
        where: { instructorid: teacherId },
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdat', 'DESC']]
      });
      
      return {
        courses: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Error in getCoursesByInstructor:', error);
      throw new Error(`Lỗi khi lấy khóa học của instructor: ${error.message}`);
    }
  }
  
  // Lấy khóa học phổ biến
  async getPopularCourses(limit = 8) {
    try {
      const popularCourses = await courses.findAll({
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname']
          }
        ],
        limit: parseInt(limit),
        order: [['enrollmentcount', 'DESC']]
      });
      
      return popularCourses;
    } catch (error) {
      console.error('Error in getPopularCourses:', error);
      throw new Error(`Lỗi khi lấy khóa học phổ biến: ${error.message}`);
    }
  }
    // Lấy khóa học mới nhất
  async getLatestCourses(limit = 8) {
    try {
      const latestCourses = await courses.findAll({
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname']
          }
        ],
        limit: parseInt(limit),
        order: [['createdat', 'DESC']]
      });
      
      return latestCourses;
    } catch (error) {
      console.error('Error in getLatestCourses:', error);
      throw new Error(`Lỗi khi lấy khóa học mới nhất: ${error.message}`);
    }
  }
  // Tìm kiếm khóa học
  async searchCourses(query, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await courses.findAndCountAll({
        where: {
          [Op.or]: [
            { coursename: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname']
          },
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdat', 'DESC']]
      });
      
      return {
        courses: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      console.error('Error in searchCourses:', error);
      throw new Error(`Lỗi khi tìm kiếm khóa học: ${error.message}`);
    }
  }
}

module.exports = new CourseService();