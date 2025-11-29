const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  /**
   * Lấy tất cả đơn hàng (cho admin)
   * @route GET /api/v1/admin/orders
   * @access Private (Admin only)
   */
  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const result = await adminService.getAllOrders({
        page,
        limit,
        status,
        search,
      });
      return ApiResponse.success(res, result, 'Lấy danh sách đơn hàng thành công');
    } catch (error) {
      console.error('Error in getAllOrders controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy chi tiết đơn hàng (cho admin)
   * @route GET /api/v1/admin/orders/:id
   * @access Private (Admin only)
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const orderId = parseInt(id);

      if (isNaN(orderId)) {
        return ApiResponse.error(res, 'ID đơn hàng không hợp lệ', 400);
      }

      console.log(`📋 Fetching order details for order ID: ${orderId}`);
      const order = await adminService.getOrderById(orderId);
      console.log(`✅ Order found:`, { orderId: order.orderid || order.id, status: order.status });
      
      return ApiResponse.success(res, order, 'Lấy chi tiết đơn hàng thành công');
    } catch (error) {
      console.error('❌ Error in getOrderById controller:', error);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, error.message || 'Lỗi khi lấy chi tiết đơn hàng', 500);
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @route PUT /api/v1/admin/orders/:id/status
   * @access Private (Admin only)
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, 'Trạng thái là bắt buộc', 400);
      }

      const orderId = parseInt(id);
      if (isNaN(orderId)) {
        return ApiResponse.error(res, 'ID đơn hàng không hợp lệ', 400);
      }

      const order = await adminService.updateOrderStatus(orderId, status);
      return ApiResponse.success(res, order, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      console.error('Error in updateOrderStatus controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('không hợp lệ')) {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy danh sách khóa học chờ duyệt
   * @route GET /api/v1/admin/pending-courses
   * @access Private (Admin only)
   */
  async getPendingCourses(req, res) {
    try {
      const pendingCourses = await adminService.getPendingCourses();
      return ApiResponse.success(res, pendingCourses, 'Lấy danh sách khóa học chờ duyệt thành công');
    } catch (error) {
      console.error('Error in getPendingCourses controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Duyệt khóa học
   * @route POST /api/v1/admin/approve-course/:id
   * @access Private (Admin only)
   */
  async approveCourse(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return ApiResponse.error(res, 'ID khóa học không hợp lệ', 400);
      }

      const course = await adminService.approveCourse(courseId);
      return ApiResponse.success(res, course, 'Duyệt khóa học thành công');
    } catch (error) {
      console.error('Error in approveCourse controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('đã được duyệt')) {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Từ chối khóa học
   * @route POST /api/v1/admin/reject-course/:id
   * @access Private (Admin only)
   */
  async rejectCourse(req, res) {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);

      if (isNaN(courseId)) {
        return ApiResponse.error(res, 'ID khóa học không hợp lệ', 400);
      }

      const course = await adminService.rejectCourse(courseId);
      return ApiResponse.success(res, course, 'Từ chối khóa học thành công');
    } catch (error) {
      console.error('Error in rejectCourse controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('đã bị từ chối')) {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy tất cả đánh giá (cho admin)
   * @route GET /api/v1/admin/reviews
   * @access Private (Admin only)
   */
  async getAllReviews(req, res) {
    try {
      const { page = 1, limit = 10, rating, courseId } = req.query;
      const result = await adminService.getAllReviews({
        page,
        limit,
        rating: rating || undefined,
        courseId: courseId || undefined,
      });
      return ApiResponse.success(res, result, 'Lấy danh sách đánh giá thành công');
    } catch (error) {
      console.error('Error in getAllReviews controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Xóa đánh giá
   * @route DELETE /api/v1/admin/reviews/:id
   * @access Private (Admin only)
   */
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const reviewId = parseInt(id);

      if (isNaN(reviewId)) {
        return ApiResponse.error(res, 'ID đánh giá không hợp lệ', 400);
      }

      const result = await adminService.deleteReview(reviewId);
      return ApiResponse.success(res, result, 'Xóa đánh giá thành công');
    } catch (error) {
      console.error('Error in deleteReview controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy tất cả mã giảm giá (cho admin)
   * @route GET /api/v1/admin/promotions
   * @access Private (Admin only)
   */
  async getAllPromotions(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await adminService.getAllPromotions({
        page,
        limit,
      });
      return ApiResponse.success(res, result, 'Lấy danh sách mã giảm giá thành công');
    } catch (error) {
      console.error('Error in getAllPromotions controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy chi tiết mã giảm giá
   * @route GET /api/v1/admin/promotions/:id
   * @access Private (Admin only)
   */
  async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        return ApiResponse.error(res, 'ID mã giảm giá không hợp lệ', 400);
      }

      const promotion = await adminService.getPromotionById(promotionId);
      return ApiResponse.success(res, promotion, 'Lấy chi tiết mã giảm giá thành công');
    } catch (error) {
      console.error('Error in getPromotionById controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Tạo mã giảm giá mới
   * @route POST /api/v1/admin/promotions
   * @access Private (Admin only)
   */
  async createPromotion(req, res) {
    try {
      const { code, discountPercentage, startDate, endDate } = req.body;

      if (!code || !discountPercentage || !startDate || !endDate) {
        return ApiResponse.error(res, 'Vui lòng điền đầy đủ thông tin', 400);
      }

      const promotion = await adminService.createPromotion({
        code,
        discountPercentage: parseInt(discountPercentage),
        startDate,
        endDate,
      });

      return ApiResponse.success(res, promotion, 'Tạo mã giảm giá thành công', 201);
    } catch (error) {
      console.error('Error in createPromotion controller:', error);
      
      if (error.message.includes('đã tồn tại') || error.message.includes('phải sau')) {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Cập nhật mã giảm giá
   * @route PUT /api/v1/admin/promotions/:id
   * @access Private (Admin only)
   */
  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const { code, discountPercentage, startDate, endDate } = req.body;

      const promotionId = parseInt(id);
      if (isNaN(promotionId)) {
        return ApiResponse.error(res, 'ID mã giảm giá không hợp lệ', 400);
      }

      const promotion = await adminService.updatePromotion(promotionId, {
        code,
        discountPercentage: discountPercentage ? parseInt(discountPercentage) : undefined,
        startDate,
        endDate,
      });

      return ApiResponse.success(res, promotion, 'Cập nhật mã giảm giá thành công');
    } catch (error) {
      console.error('Error in updatePromotion controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }
      
      if (error.message.includes('đã tồn tại') || error.message.includes('phải sau')) {
        return ApiResponse.error(res, error.message, 400);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Xóa mã giảm giá
   * @route DELETE /api/v1/admin/promotions/:id
   * @access Private (Admin only)
   */
  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        return ApiResponse.error(res, 'ID mã giảm giá không hợp lệ', 400);
      }

      const result = await adminService.deletePromotion(promotionId);
      return ApiResponse.success(res, result, 'Xóa mã giảm giá thành công');
    } catch (error) {
      console.error('Error in deletePromotion controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy tất cả tin nhắn (cho admin)
   * @route GET /api/v1/admin/messages
   * @access Private (Admin only)
   */
  async getAllMessages(req, res) {
    try {
      const { page = 1, limit = 20, senderId, receiverId, search, startDate, endDate, seen } = req.query;
      const result = await adminService.getAllMessages({
        page,
        limit,
        senderId,
        receiverId,
        search,
        startDate,
        endDate,
        seen
      });
      return ApiResponse.success(res, result, 'Lấy danh sách tin nhắn thành công');
    } catch (error) {
      console.error('Error in getAllMessages controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy thống kê tin nhắn (cho admin)
   * @route GET /api/v1/admin/messages/stats
   * @access Private (Admin only)
   */
  async getMessageStats(req, res) {
    try {
      const stats = await adminService.getMessageStats();
      return ApiResponse.success(res, stats, 'Lấy thống kê tin nhắn thành công');
    } catch (error) {
      console.error('Error in getMessageStats controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Xóa tin nhắn (cho admin)
   * @route DELETE /api/v1/admin/messages/:id
   * @access Private (Admin only)
   */
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const messageId = parseInt(id);

      if (isNaN(messageId)) {
        return ApiResponse.error(res, 'ID tin nhắn không hợp lệ', 400);
      }

      const result = await adminService.deleteMessage(messageId);
      return ApiResponse.success(res, result, 'Xóa tin nhắn thành công');
    } catch (error) {
      console.error('Error in deleteMessage controller:', error);
      
      if (error.message.includes('không tồn tại')) {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Xóa nhiều tin nhắn (cho admin)
   * @route DELETE /api/v1/admin/messages
   * @access Private (Admin only)
   */
  async deleteMultipleMessages(req, res) {
    try {
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return ApiResponse.error(res, 'Danh sách ID tin nhắn không hợp lệ', 400);
      }

      const result = await adminService.deleteMultipleMessages(messageIds);
      return ApiResponse.success(res, result, 'Xóa tin nhắn thành công');
    } catch (error) {
      console.error('Error in deleteMultipleMessages controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Lấy tất cả cuộc trò chuyện (cho admin)
   * @route GET /api/v1/admin/messages/conversations
   * @access Private (Admin only)
   */
  async getAllConversations(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const adminId = req.user.id;
      const result = await adminService.getAllConversations({
        page,
        limit,
        adminId
      });
      return ApiResponse.success(res, result, 'Lấy danh sách cuộc trò chuyện thành công');
    } catch (error) {
      console.error('Error in getAllConversations controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  /**
   * Tìm kiếm tin nhắn (cho admin)
   * @route GET /api/v1/admin/messages/search
   * @access Private (Admin only)
   */
  async searchMessages(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q) {
        return ApiResponse.error(res, 'Vui lòng nhập từ khóa tìm kiếm', 400);
      }

      const result = await adminService.searchMessages(q, { page, limit });
      return ApiResponse.success(res, result, 'Tìm kiếm tin nhắn thành công');
    } catch (error) {
      console.error('Error in searchMessages controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AdminController();
