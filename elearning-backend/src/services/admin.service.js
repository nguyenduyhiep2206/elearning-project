const { orders, orderdetails, users, courses, coursereviews, promotions } = require('../models');

class AdminService {
  /**
   * Lấy tất cả đơn hàng (cho admin)
   * @param {Object} options - Tùy chọn: page, limit, status
   * @returns {Promise<Object>} - Danh sách đơn hàng với phân trang
   */
  async getAllOrders(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Lọc theo status
      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await orders.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email'],
            required: false,
          },
          {
            model: orderdetails,
            as: 'orderdetails',
            required: false,
            include: [
              {
                model: courses,
                as: 'course',
                attributes: ['courseid', 'coursename', 'imageurl'],
                required: false,
              },
            ],
          },
        ],
        order: [['createdat', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        orders: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết đơn hàng (cho admin)
   * @param {number} orderId - ID đơn hàng
   * @returns {Promise<Object>} - Chi tiết đơn hàng
   */
  async getOrderById(orderId) {
    try {
      const order = await orders.findByPk(orderId, {
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email'],
            required: false,
          },
          {
            model: orderdetails,
            as: 'orderdetails',
            required: false,
            include: [
              {
                model: courses,
                as: 'course',
                attributes: ['courseid', 'coursename', 'imageurl', 'price'],
                required: false,
              },
            ],
          },
        ],
      });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Lỗi khi lấy chi tiết đơn hàng: ${error.message}`);
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {number} orderId - ID đơn hàng
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} - Đơn hàng đã được cập nhật
   */
  async updateOrderStatus(orderId, status) {
    try {
      const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      }

      const order = await orders.findByPk(orderId);
      if (!order) {
        throw new Error('Đơn hàng không tồn tại');
      }

      await order.update({ status });
      return order;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw new Error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách khóa học chờ duyệt
   * @returns {Promise<Array>} - Danh sách khóa học chờ duyệt
   */
  async getPendingCourses() {
    try {
      const { courses, users } = require('../models');
      const pendingCourses = await courses.findAll({
        where: {
          status: 'Pending'
        },
        include: [
          {
            model: users,
            as: 'teacher',
            attributes: ['userid', 'fullname', 'email']
          }
        ],
        order: [['createdat', 'DESC']]
      });

      // Format dữ liệu để trả về
      return pendingCourses.map(course => ({
        id: course.courseid,
        courseId: course.courseid,
        title: course.coursename,
        courseName: course.coursename,
        teacherName: course.teacher?.fullname || 'N/A',
        instructorName: course.teacher?.fullname || 'N/A',
        teacherEmail: course.teacher?.email || null,
        createdAt: course.createdat,
        createdDate: course.createdat,
        description: course.description,
        price: course.price,
        imageurl: course.imageurl
      }));
    } catch (error) {
      console.error('Error in getPendingCourses:', error);
      throw new Error(`Lỗi khi lấy danh sách khóa học chờ duyệt: ${error.message}`);
    }
  }

  /**
   * Duyệt khóa học
   * @param {number} courseId - ID khóa học
   * @returns {Promise<Object>} - Khóa học đã được duyệt
   */
  async approveCourse(courseId) {
    try {
      const { courses } = require('../models');
      const course = await courses.findByPk(courseId);

      if (!course) {
        throw new Error('Khóa học không tồn tại');
      }

      if (course.status === 'Approved') {
        throw new Error('Khóa học đã được duyệt rồi');
      }

      // Cập nhật status thành Approved
      await course.update({
        status: 'Approved'
      });

      return {
        id: course.courseid,
        title: course.coursename,
        status: course.status
      };
    } catch (error) {
      console.error('Error in approveCourse:', error);
      throw new Error(`Lỗi khi duyệt khóa học: ${error.message}`);
    }
  }

  /**
   * Từ chối khóa học
   * @param {number} courseId - ID khóa học
   * @returns {Promise<Object>} - Khóa học đã bị từ chối
   */
  async rejectCourse(courseId) {
    try {
      const { courses } = require('../models');
      const course = await courses.findByPk(courseId);

      if (!course) {
        throw new Error('Khóa học không tồn tại');
      }

      if (course.status === 'Rejected') {
        throw new Error('Khóa học đã bị từ chối rồi');
      }

      // Cập nhật status thành Rejected
      await course.update({
        status: 'Rejected'
      });

      return {
        id: course.courseid,
        title: course.coursename,
        status: course.status
      };
    } catch (error) {
      console.error('Error in rejectCourse:', error);
      throw new Error(`Lỗi khi từ chối khóa học: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả đánh giá (cho admin)
   * @param {Object} options - Tùy chọn: page, limit, rating, courseId
   * @returns {Promise<Object>} - Danh sách đánh giá với phân trang
   */
  async getAllReviews(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        rating = null,
        courseId = null,
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Lọc theo rating
      if (rating) {
        whereClause.rating = parseInt(rating);
      }

      // Lọc theo courseId
      if (courseId) {
        whereClause.courseid = parseInt(courseId);
      }

      const { count, rows } = await coursereviews.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: users,
            as: 'student',
            attributes: ['userid', 'fullname', 'email'],
            required: false,
          },
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'imageurl'],
            required: false,
          },
        ],
        order: [['createdat', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        reviews: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      throw new Error(`Lỗi khi lấy danh sách đánh giá: ${error.message}`);
    }
  }

  /**
   * Xóa đánh giá
   * @param {number} reviewId - ID đánh giá
   * @returns {Promise<Object>} - Kết quả xóa
   */
  async deleteReview(reviewId) {
    try {
      const review = await coursereviews.findByPk(reviewId);

      if (!review) {
        throw new Error('Đánh giá không tồn tại');
      }

      await review.destroy();

      return {
        id: reviewId,
        message: 'Đánh giá đã được xóa thành công'
      };
    } catch (error) {
      console.error('Error in deleteReview:', error);
      throw new Error(`Lỗi khi xóa đánh giá: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả mã giảm giá (cho admin)
   * @param {Object} options - Tùy chọn: page, limit
   * @returns {Promise<Object>} - Danh sách mã giảm giá với phân trang
   */
  async getAllPromotions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
      } = options;

      const offset = (page - 1) * limit;

      const { count, rows } = await promotions.findAndCountAll({
        order: [['createdat', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        promotions: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error in getAllPromotions:', error);
      throw new Error(`Lỗi khi lấy danh sách mã giảm giá: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết mã giảm giá
   * @param {number} promotionId - ID mã giảm giá
   * @returns {Promise<Object>} - Chi tiết mã giảm giá
   */
  async getPromotionById(promotionId) {
    try {
      const promotion = await promotions.findByPk(promotionId);

      if (!promotion) {
        throw new Error('Mã giảm giá không tồn tại');
      }

      return promotion;
    } catch (error) {
      console.error('Error in getPromotionById:', error);
      throw new Error(`Lỗi khi lấy chi tiết mã giảm giá: ${error.message}`);
    }
  }

  /**
   * Tạo mã giảm giá mới
   * @param {Object} data - Dữ liệu mã giảm giá
   * @returns {Promise<Object>} - Mã giảm giá đã tạo
   */
  async createPromotion(data) {
    try {
      const { code, discountPercentage, startDate, endDate } = data;

      // Kiểm tra code đã tồn tại chưa
      const existingPromotion = await promotions.findOne({
        where: { code: code.toUpperCase() }
      });

      if (existingPromotion) {
        throw new Error('Mã giảm giá đã tồn tại');
      }

      // Kiểm tra ngày
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      const newPromotion = await promotions.create({
        code: code.toUpperCase(),
        discountpercentage: discountPercentage,
        startdate: start,
        enddate: end,
      });

      return newPromotion;
    } catch (error) {
      console.error('Error in createPromotion:', error);
      throw new Error(`Lỗi khi tạo mã giảm giá: ${error.message}`);
    }
  }

  /**
   * Cập nhật mã giảm giá
   * @param {number} promotionId - ID mã giảm giá
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Mã giảm giá đã cập nhật
   */
  async updatePromotion(promotionId, data) {
    try {
      const promotion = await promotions.findByPk(promotionId);

      if (!promotion) {
        throw new Error('Mã giảm giá không tồn tại');
      }

      const { code, discountPercentage, startDate, endDate } = data;
      const updateData = {};

      // Nếu có code mới, kiểm tra trùng
      if (code && code.toUpperCase() !== promotion.code) {
        const existingPromotion = await promotions.findOne({
          where: { code: code.toUpperCase() }
        });

        if (existingPromotion) {
          throw new Error('Mã giảm giá đã tồn tại');
        }
        updateData.code = code.toUpperCase();
      }

      if (discountPercentage !== undefined) {
        updateData.discountpercentage = discountPercentage;
      }

      if (startDate) {
        updateData.startdate = new Date(startDate);
      }

      if (endDate) {
        updateData.enddate = new Date(endDate);
      }

      // Kiểm tra ngày hợp lệ
      const start = updateData.startdate || promotion.startdate;
      const end = updateData.enddate || promotion.enddate;
      
      if (new Date(start) >= new Date(end)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      await promotion.update(updateData);

      return promotion;
    } catch (error) {
      console.error('Error in updatePromotion:', error);
      throw new Error(`Lỗi khi cập nhật mã giảm giá: ${error.message}`);
    }
  }

  /**
   * Xóa mã giảm giá
   * @param {number} promotionId - ID mã giảm giá
   * @returns {Promise<Object>} - Kết quả xóa
   */
  async deletePromotion(promotionId) {
    try {
      const promotion = await promotions.findByPk(promotionId);

      if (!promotion) {
        throw new Error('Mã giảm giá không tồn tại');
      }

      await promotion.destroy();

      return {
        id: promotionId,
        message: 'Mã giảm giá đã được xóa thành công'
      };
    } catch (error) {
      console.error('Error in deletePromotion:', error);
      throw new Error(`Lỗi khi xóa mã giảm giá: ${error.message}`);
    }
  }
}

module.exports = new AdminService();

