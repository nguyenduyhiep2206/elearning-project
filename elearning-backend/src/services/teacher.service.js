const { courses, categories, users, orders, orderdetails, chapters, lessons } = require('../models');
const { Op } = require('sequelize');
const courseService = require('./course.service');

class TeacherService {
  /**
   * Lấy thống kê của teacher
   * @param {number} teacherId - ID của teacher
   * @returns {Promise<Object>}
   */
  async getStats(teacherId) {
    try {
      // Tổng số khóa học
      const totalCourses = await courses.count({
        where: { teacherid: teacherId },
      });

      // Số khóa học đã duyệt
      const approvedCourses = await courses.count({
        where: {
          teacherid: teacherId,
          status: 'Approved',
        },
      });

      // Số khóa học chờ duyệt
      const pendingCourses = await courses.count({
        where: {
          teacherid: teacherId,
          status: 'Pending',
        },
      });

      // Tính tổng số học viên (từ các đơn hàng đã hoàn thành)
      const completedOrders = await orders.findAll({
        where: {
          status: 'Completed',
        },
        include: [
          {
            model: orderdetails,
            as: 'orderdetails',
            required: true,
            include: [
              {
                model: courses,
                as: 'course',
                required: true,
                where: {
                  teacherid: teacherId,
                },
                attributes: [],
              },
            ],
            attributes: [],
          },
        ],
        attributes: ['orderid'],
        distinct: true,
        col: 'orderid',
      });

      // Đếm số học viên duy nhất (từ userid trong orders)
      const uniqueStudents = new Set();
      completedOrders.forEach((order) => {
        if (order.userid) {
          uniqueStudents.add(order.userid);
        }
      });

      return {
        totalCourses,
        approvedCourses,
        pendingCourses,
        totalStudents: uniqueStudents.size,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new Error(`Lỗi khi lấy thống kê: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách khóa học của teacher
   * @param {number} teacherId - ID của teacher
   * @param {Object} options - Tùy chọn: page, limit, status
   * @returns {Promise<Object>}
   */
  async getMyCourses(teacherId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const offset = (page - 1) * limit;

      const whereClause = {
        teacherid: teacherId,
      };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await courses.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname'],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdat', 'DESC']],
      });

      return {
        courses: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in getMyCourses:', error);
      throw new Error(`Lỗi khi lấy danh sách khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết khóa học của teacher
   * @param {number} teacherId - ID của teacher
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<Object>}
   */
  async getCourseById(teacherId, courseId) {
    try {
      const course = await courses.findOne({
        where: {
          courseid: courseId,
          teacherid: teacherId,
        },
        include: [
          {
            model: categories,
            as: 'category',
            attributes: ['categoryid', 'categoryname'],
            required: false,
          },
        ],
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học hoặc bạn không có quyền truy cập');
        error.statusCode = 404;
        throw error;
      }

      return course;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }

  /**
   * Tạo khóa học mới
   * @param {number} teacherId - ID của teacher
   * @param {Object} courseData - Dữ liệu khóa học
   * @returns {Promise<Object>}
   */
  async createCourse(teacherId, courseData) {
    try {
      // Map camelCase to snake_case
      const newCourse = await courses.create({
        coursename: courseData.courseName || courseData.coursename,
        description: courseData.description,
        teacherid: teacherId,
        categoryid: courseData.categoryId || courseData.categoryid,
        price: courseData.price || 0,
        imageurl: courseData.imageUrl || courseData.imageurl,
        duration: courseData.duration,
        level: courseData.level,
        language: courseData.language,
        status: 'Pending', // Mặc định là chờ duyệt
      });

      return newCourse;
    } catch (error) {
      console.error('Error in createCourse:', error);
      throw new Error(`Lỗi khi tạo khóa học: ${error.message}`);
    }
  }

  /**
   * Cập nhật khóa học
   * @param {number} teacherId - ID của teacher
   * @param {number} courseId - ID của khóa học
   * @param {Object} courseData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateCourse(teacherId, courseId, courseData) {
    try {
      const course = await courses.findOne({
        where: {
          courseid: courseId,
          teacherid: teacherId,
        },
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học hoặc bạn không có quyền chỉnh sửa');
        error.statusCode = 404;
        throw error;
      }

      // Map camelCase to snake_case
      const updateData = {};
      if (courseData.courseName || courseData.coursename) {
        updateData.coursename = courseData.courseName || courseData.coursename;
      }
      if (courseData.description !== undefined) {
        updateData.description = courseData.description;
      }
      if (courseData.categoryId || courseData.categoryid) {
        updateData.categoryid = courseData.categoryId || courseData.categoryid;
      }
      if (courseData.price !== undefined) {
        updateData.price = courseData.price;
      }
      if (courseData.imageUrl || courseData.imageurl) {
        updateData.imageurl = courseData.imageUrl || courseData.imageurl;
      }
      if (courseData.duration !== undefined) {
        updateData.duration = courseData.duration;
      }
      if (courseData.level !== undefined) {
        updateData.level = courseData.level;
      }
      if (courseData.language !== undefined) {
        updateData.language = courseData.language;
      }

      await course.update(updateData);
      return course;
    } catch (error) {
      console.error('Error in updateCourse:', error);
      throw error;
    }
  }

  /**
   * Xóa khóa học
   * @param {number} teacherId - ID của teacher
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<void>}
   */
  async deleteCourse(teacherId, courseId) {
    try {
      const course = await courses.findOne({
        where: {
          courseid: courseId,
          teacherid: teacherId,
        },
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học hoặc bạn không có quyền xóa');
        error.statusCode = 404;
        throw error;
      }

      await course.destroy();
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách học viên đã đăng ký khóa học của teacher
   * @param {number} teacherId - ID của teacher
   * @param {Object} options - Tùy chọn: page, limit, courseId, search
   * @returns {Promise<Object>}
   */
  async getStudents(teacherId, options = {}) {
    try {
      const { page = 1, limit = 10, courseId, search } = options;

      // Tìm các orderdetails có course thuộc teacher này và order status = Completed
      const whereClause = {
        status: 'Completed',
      };

      const courseWhere = {
        teacherid: teacherId,
      };

      if (courseId) {
        courseWhere.courseid = courseId;
      }

      const userWhere = {};
      if (search) {
        userWhere[Op.or] = [
          { fullname: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Lấy tất cả orders có course của teacher này
      const allOrders = await orders.findAll({
        where: whereClause,
        include: [
          {
            model: orderdetails,
            as: 'orderdetails',
            required: true,
            include: [
              {
                model: courses,
                as: 'course',
                required: true,
                where: courseWhere,
                attributes: ['courseid', 'coursename', 'imageurl'],
              },
            ],
          },
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email', 'profilepicture'],
            required: true,
            where: userWhere,
          },
        ],
        order: [['createdat', 'DESC']],
      });

      // Nhóm theo học viên và khóa học
      const studentMap = new Map();

      allOrders.forEach((order) => {
        const userId = order.userid;
        const user = order.user;

        order.orderdetails.forEach((detail) => {
          const course = detail.course;
          const key = `${userId}-${course.courseid}`;

          if (!studentMap.has(key)) {
            studentMap.set(key, {
              userId: user.userid,
              fullname: user.fullname,
              email: user.email,
              profilePicture: user.profilepicture,
              courseId: course.courseid,
              courseName: course.coursename,
              courseImage: course.imageurl,
              enrolledAt: order.createdat,
              orderId: order.orderid,
            });
          }
        });
      });

      const allStudents = Array.from(studentMap.values());
      const totalCount = allStudents.length;
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;
      const students = allStudents.slice(offset, offset + parseInt(limit));

      return {
        students,
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw new Error(`Lỗi khi lấy danh sách học viên: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách chapters của khóa học
   * @param {number} teacherId - ID của teacher
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<Array>}
   */
  async getChapters(teacherId, courseId) {
    try {
      // Kiểm tra khóa học thuộc về teacher
      const course = await courses.findOne({
        where: {
          courseid: courseId,
          teacherid: teacherId,
        },
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học hoặc bạn không có quyền truy cập');
        error.statusCode = 404;
        throw error;
      }

      const chaptersList = await chapters.findAll({
        where: { courseid: courseId },
        include: [
          {
            model: lessons,
            as: 'lessons',
            required: false,
            separate: true,
            order: [['sortorder', 'ASC']],
          },
        ],
        order: [['sortorder', 'ASC']],
      });

      return chaptersList;
    } catch (error) {
      console.error('Error in getChapters:', error);
      throw error;
    }
  }

  /**
   * Tạo chapter mới
   * @param {number} teacherId - ID của teacher
   * @param {number} courseId - ID của khóa học
   * @param {Object} chapterData - Dữ liệu chapter
   * @returns {Promise<Object>}
   */
  async createChapter(teacherId, courseId, chapterData) {
    try {
      // Kiểm tra khóa học thuộc về teacher
      const course = await courses.findOne({
        where: {
          courseid: courseId,
          teacherid: teacherId,
        },
      });

      if (!course) {
        const error = new Error('Không tìm thấy khóa học hoặc bạn không có quyền truy cập');
        error.statusCode = 404;
        throw error;
      }

      // Lấy sortorder cao nhất
      const maxSortOrder = await chapters.max('sortorder', {
        where: { courseid: courseId },
      });

      const newChapter = await chapters.create({
        courseid: courseId,
        title: chapterData.title,
        description: chapterData.description || null,
        sortorder: (maxSortOrder || 0) + 1,
      });

      return newChapter;
    } catch (error) {
      console.error('Error in createChapter:', error);
      throw new Error(`Lỗi khi tạo chapter: ${error.message}`);
    }
  }

  /**
   * Cập nhật chapter
   * @param {number} teacherId - ID của teacher
   * @param {number} chapterId - ID của chapter
   * @param {Object} chapterData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateChapter(teacherId, chapterId, chapterData) {
    try {
      const chapter = await chapters.findOne({
        where: { chapterid: chapterId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!chapter) {
        const error = new Error('Không tìm thấy chapter hoặc bạn không có quyền chỉnh sửa');
        error.statusCode = 404;
        throw error;
      }

      const updateData = {};
      if (chapterData.title !== undefined) updateData.title = chapterData.title;
      if (chapterData.description !== undefined) updateData.description = chapterData.description;
      if (chapterData.sortorder !== undefined) updateData.sortorder = chapterData.sortorder;

      await chapter.update(updateData);
      return chapter;
    } catch (error) {
      console.error('Error in updateChapter:', error);
      throw error;
    }
  }

  /**
   * Xóa chapter
   * @param {number} teacherId - ID của teacher
   * @param {number} chapterId - ID của chapter
   * @returns {Promise<void>}
   */
  async deleteChapter(teacherId, chapterId) {
    try {
      const chapter = await chapters.findOne({
        where: { chapterid: chapterId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!chapter) {
        const error = new Error('Không tìm thấy chapter hoặc bạn không có quyền xóa');
        error.statusCode = 404;
        throw error;
      }

      // Xóa tất cả lessons trong chapter trước
      await lessons.destroy({
        where: { chapterid: chapterId },
      });

      await chapter.destroy();
    } catch (error) {
      console.error('Error in deleteChapter:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lessons của chapter
   * @param {number} teacherId - ID của teacher
   * @param {number} chapterId - ID của chapter
   * @returns {Promise<Array>}
   */
  async getLessons(teacherId, chapterId) {
    try {
      const chapter = await chapters.findOne({
        where: { chapterid: chapterId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!chapter) {
        const error = new Error('Không tìm thấy chapter hoặc bạn không có quyền truy cập');
        error.statusCode = 404;
        throw error;
      }

      const lessonsList = await lessons.findAll({
        where: { chapterid: chapterId },
        order: [['sortorder', 'ASC']],
      });

      return lessonsList;
    } catch (error) {
      console.error('Error in getLessons:', error);
      throw error;
    }
  }

  /**
   * Tạo lesson mới
   * @param {number} teacherId - ID của teacher
   * @param {number} chapterId - ID của chapter
   * @param {Object} lessonData - Dữ liệu lesson
   * @returns {Promise<Object>}
   */
  async createLesson(teacherId, chapterId, lessonData) {
    try {
      const chapter = await chapters.findOne({
        where: { chapterid: chapterId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!chapter) {
        const error = new Error('Không tìm thấy chapter hoặc bạn không có quyền truy cập');
        error.statusCode = 404;
        throw error;
      }

      // Lấy sortorder cao nhất
      const maxSortOrder = await lessons.max('sortorder', {
        where: { chapterid: chapterId },
      });

      const newLesson = await lessons.create({
        courseid: chapter.courseid,
        chapterid: chapterId,
        title: lessonData.title,
        content: lessonData.content || null,
        videourl: lessonData.videoUrl || lessonData.videourl || null,
        sortorder: (maxSortOrder || 0) + 1,
      });

      return newLesson;
    } catch (error) {
      console.error('Error in createLesson:', error);
      throw new Error(`Lỗi khi tạo lesson: ${error.message}`);
    }
  }

  /**
   * Cập nhật lesson
   * @param {number} teacherId - ID của teacher
   * @param {number} lessonId - ID của lesson
   * @param {Object} lessonData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateLesson(teacherId, lessonId, lessonData) {
    try {
      const lesson = await lessons.findOne({
        where: { lessonid: lessonId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!lesson) {
        const error = new Error('Không tìm thấy lesson hoặc bạn không có quyền chỉnh sửa');
        error.statusCode = 404;
        throw error;
      }

      const updateData = {};
      if (lessonData.title !== undefined) updateData.title = lessonData.title;
      if (lessonData.content !== undefined) updateData.content = lessonData.content;
      if (lessonData.videoUrl !== undefined || lessonData.videourl !== undefined) {
        updateData.videourl = lessonData.videoUrl || lessonData.videourl;
      }
      if (lessonData.sortorder !== undefined) updateData.sortorder = lessonData.sortorder;

      await lesson.update(updateData);
      return lesson;
    } catch (error) {
      console.error('Error in updateLesson:', error);
      throw error;
    }
  }

  /**
   * Xóa lesson
   * @param {number} teacherId - ID của teacher
   * @param {number} lessonId - ID của lesson
   * @returns {Promise<void>}
   */
  async deleteLesson(teacherId, lessonId) {
    try {
      const lesson = await lessons.findOne({
        where: { lessonid: lessonId },
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
          },
        ],
      });

      if (!lesson) {
        const error = new Error('Không tìm thấy lesson hoặc bạn không có quyền xóa');
        error.statusCode = 404;
        throw error;
      }

      await lesson.destroy();
    } catch (error) {
      console.error('Error in deleteLesson:', error);
      throw error;
    }
  }
}

module.exports = new TeacherService();

