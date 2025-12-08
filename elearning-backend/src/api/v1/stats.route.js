const express = require('express');
const router = express.Router();
const statsController = require('../../controllers/stats.controller');
const { verifyToken, requireAdmin } = require('../../middlewares/auth.middleware');

/**
 * @route GET /api/v1/stats/overview
 * @desc Lấy thống kê tổng quan
 * @access Private (Admin only)
 */
router.get('/overview', verifyToken, requireAdmin, statsController.getOverviewStats.bind(statsController));

module.exports = router;

