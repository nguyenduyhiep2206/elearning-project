const statsService = require('../services/stats.service');
const ApiResponse = require('../utils/apiResponse');

class StatsController {
  /**
   * Lấy thống kê tổng quan
   * @route GET /api/v1/stats/overview
   * @access Private (Admin only)
   */
  async getOverviewStats(req, res) {
    try {
      const stats = await statsService.getOverviewStats();
      return ApiResponse.success(res, stats, 'Lấy thống kê tổng quan thành công');
    } catch (error) {
      console.error('Error in getOverviewStats controller:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new StatsController();

