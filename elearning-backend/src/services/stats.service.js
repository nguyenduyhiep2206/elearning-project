const { sequelize, orders, users, courses, coursereviews, promotions } = require('../models');
const { Op } = require('sequelize');

class StatsService {
  /**
   * Lấy thống kê tổng quan
   * @returns {Promise<Object>} - Thống kê tổng quan
   */
  async getOverviewStats() {
    try {
      // Tổng doanh thu - chỉ tính các đơn hàng đã thanh toán thành công (status = 'Completed')
      const totalRevenueResult = await orders.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('totalamount')), 0), 'total']
        ],
        where: {
          status: 'Completed',
        },
        raw: true
      });
      const totalRevenue = parseFloat(totalRevenueResult?.total || 0);

      // Tổng số học viên (users có role student hoặc không có role admin/teacher)
      const totalStudentsResult = await users.count({
        where: {
          role: {
            [Op.notIn]: ['admin', 'teacher']
          }
        }
      });

      // Tổng số khóa học
      const totalCoursesResult = await courses.count();

      // Tổng số đơn hàng (tất cả trạng thái)
      const totalOrdersResult = await orders.count();

      // Tổng số đánh giá
      const totalReviewsResult = await coursereviews.count();

      // Tổng số mã giảm giá
      const totalPromotionsResult = await promotions.count();

      // Số khóa học chờ duyệt
      const pendingCoursesResult = await courses.count({
        where: {
          status: 'Pending'
        }
      });

      // Doanh thu hôm nay - chỉ đơn hàng Completed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenueResult = await orders.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('totalamount')), 0), 'total']
        ],
        where: {
          status: 'Completed',
          createdat: {
            [Op.gte]: today
          }
        },
        raw: true
      });
      const todayRevenue = parseFloat(todayRevenueResult?.total || 0);

      // Đơn hàng hôm nay (tất cả trạng thái)
      const todayOrdersResult = await orders.count({
        where: {
          createdat: {
            [Op.gte]: today
          }
        }
      });

      return {
        totalRevenue,
        totalStudents: totalStudentsResult,
        totalCourses: totalCoursesResult,
        totalOrders: totalOrdersResult,
        totalReviews: totalReviewsResult,
        totalPromotions: totalPromotionsResult,
        pendingCourses: pendingCoursesResult,
        todayRevenue,
        todayOrders: todayOrdersResult
      };
    } catch (error) {
      console.error('Error in getOverviewStats:', error);
      throw new Error(`Lỗi khi lấy thống kê tổng quan: ${error.message}`);
    }
  }
}

module.exports = new StatsService();

