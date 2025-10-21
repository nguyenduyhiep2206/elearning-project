const authService = require('../services/auth.service');
const { users } = require('../models');

/**
 * Middleware xác thực JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
    try {
        // Lấy token từ header hoặc cookie
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token không được cung cấp',
                data: null
            });
        }

        // Xác thực token
        const decoded = await authService.verifyToken(token);
        
        // Lấy thông tin user từ database
        const user = await users.findOne({
            where: { userid: decoded.userId },
            attributes: { exclude: ['passwordhash'] } // Bỏ mật khẩu
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại',
                data: null
            });
        }

        // Thêm thông tin user vào request object
        req.user = {
            id: user.userid,
            fullName: user.fullname,
            email: user.email,
            role: user.role,
            isActive: user.isactive,
            createdAt: user.createdat,
            lastLogin: user.lastlogin
        };

        // Thêm thông tin token vào request object
        req.token = token;
        req.tokenPayload = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn',
            data: null
        });
    }
};

/**
 * Middleware kiểm tra quyền admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa xác thực',
            data: null
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập',
            data: null
        });
    }

    next();
};

/**
 * Middleware kiểm tra quyền instructor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireInstructor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa xác thực',
            data: null
        });
    }

    if (!['admin', 'instructor'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập',
            data: null
        });
    }

    next();
};

/**
 * Middleware kiểm tra quyền user (student, instructor, admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa xác thực',
            data: null
        });
    }

    next();
};

module.exports = {
    verifyToken,
    requireAdmin,
    requireInstructor,
    requireAuth
};