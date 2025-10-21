const authService = require('../services/auth.service');

/**
 * Đăng nhập người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc',
                data: null
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ',
                data: null
            });
        }

        // Call auth service
        const { token, user } = await authService.login(email, password);

        // Return success response theo format yêu cầu
        res.status(200).json({
            message: 'Đăng nhập thành côngcông!',
            token: token,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        // Log error for debugging
        console.error('Login controller error:', error.message);
        
        // Return appropriate error response
        if (error.message.includes('Email hoặc mật khẩu không chính xác')) {
            return res.status(401).json({
                success: false,
                message: 'Sai email hoặc mật khẩu.',
                data: null
            });
        }

        if (error.message.includes('Tài khoản đã bị vô hiệu hóa')) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa',
                data: null
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi server. Vui lòng thử lại sau',
            data: null
        });
    }
};

/**
 * Đăng xuất người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logout = async (req, res, next) => {
    try {
        // Clear HTTP-only cookie
        res.clearCookie('authToken');
        
        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công',
            data: null
        });
    } catch (error) {
        console.error('Logout controller error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi server. Vui lòng thử lại sau',
            data: null
        });
    }
};

/**
 * Xác thực token và lấy thông tin user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token không được cung cấp',
                data: null
            });
        }

        const decoded = await authService.verifyToken(token);
        
        res.status(200).json({
            success: true,
            message: 'Token hợp lệ',
            data: {
                user: decoded
            }
        });
    } catch (error) {
        console.error('Verify auth controller error:', error.message);
        res.status(401).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

/**
 * Đăng ký người dùng mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate request body
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên, email và mật khẩu là bắt buộc',
                data: null
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ',
                data: null
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
                data: null
            });
        }

        // Call auth service
        const { token, user } = await authService.register(fullName, email, password);

        // Set HTTP-only cookie for additional security (optional)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        // Log error for debugging
        console.error('Register controller error:', error.message);
        
        // Return appropriate error response
        if (error.message.includes('Email đã được sử dụng')) {
            return res.status(409).json({
                success: false,
                message: error.message,
                data: null
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi server. Vui lòng thử lại sau',
            data: null
        });
    }
};

module.exports = {
    login,
    register,
    logout,
    verifyAuth
};