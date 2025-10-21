const { users } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Đăng nhập người dùng
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu người dùng
 * @returns {Promise<{user: Object, token: string}>} - Thông tin user và JWT token
 * @throws {Error} - Lỗi khi đăng nhập thất bại
 */
const login = async (email, password) => {
    try {
        // Validate input
        if (!email || !password) {
            throw new Error('Email và mật khẩu là bắt buộc');
        }

        // 1. Tìm người dùng bằng email
        const user = await users.findOne({ 
            where: { 
                email: email.toLowerCase().trim() 
            } 
        });

        // 2. Nếu không tìm thấy người dùng, báo lỗi
        if (!user) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // 3. Kiểm tra trạng thái tài khoản
        if (user.isactive === false) {
            throw new Error('Tài khoản đã bị vô hiệu hóa');
        }

        // 4. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        const isPasswordMatch = await bcrypt.compare(password, user.passwordhash);

        // 5. Nếu mật khẩu không khớp, báo lỗi
        if (!isPasswordMatch) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // 6. Tạo JWT token
        const tokenPayload = { 
            userId: user.userid, 
            email: user.email, 
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret-key-for-development', { 
            expiresIn: '1h',
            issuer: 'elearning-app',
            audience: 'elearning-users'
        });

        // 7. Cập nhật thời gian đăng nhập cuối
        await users.update(
            { lastlogin: new Date() },
            { where: { userid: user.userid } }
        );

        // 8. Trả về thông tin người dùng (bỏ mật khẩu) và token
        return {
            user: {
                id: user.userid,
                fullName: user.fullname,
                email: user.email,
                role: user.role,
                isActive: user.isactive,
                createdAt: user.createdat,
                lastLogin: new Date()
            },
            token
        };
    } catch (error) {
        // Log error for debugging (in production, use proper logging)
        console.error('Login error:', error.message);
        throw error;
    }
};

/**
 * Xác thực JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Decoded token payload
 * @throws {Error} - Lỗi khi token không hợp lệ
 */
const verifyToken = async (token) => {
    try {
        if (!token) {
            throw new Error('Token không được cung cấp');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development', {
            issuer: 'elearning-app',
            audience: 'elearning-users'
        });

        // Kiểm tra user còn tồn tại và active không
        const user = await users.findOne({ 
            where: { 
                userid: decoded.userId,
                isactive: true 
            } 
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error.message);
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
};

/**
 * Đăng ký người dùng mới
 * @param {string} fullName - Họ và tên người dùng
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu người dùng
 * @returns {Promise<{user: Object, token: string}>} - Thông tin user và JWT token
 * @throws {Error} - Lỗi khi đăng ký thất bại
 */
const register = async (fullName, email, password) => {
    try {
        // Validate input
        if (!fullName || !email || !password) {
            throw new Error('Họ tên, email và mật khẩu là bắt buộc');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Định dạng email không hợp lệ');
        }

        // Validate password length
        if (password.length < 6) {
            throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        }

        // Check if user already exists
        const existingUser = await users.findOne({ 
            where: { 
                email: email.toLowerCase().trim() 
            } 
        });

        if (existingUser) {
            throw new Error('Email đã được sử dụng');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await users.create({
            fullname: fullName.trim(),
            email: email.toLowerCase().trim(),
            passwordhash: hashedPassword,
            role: 'student', // Default role
            isactive: true,
            createdat: new Date(),
            lastlogin: null
        });

        // Generate JWT token
        const tokenPayload = { 
            userId: newUser.userid, 
            email: newUser.email, 
            role: newUser.role,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret-key-for-development', { 
            expiresIn: '1h',
            issuer: 'elearning-app',
            audience: 'elearning-users'
        });

        // Return user data (excluding password hash) and token
        return {
            user: {
                id: newUser.userid,
                fullName: newUser.fullname,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isactive,
                createdAt: newUser.createdat,
                lastLogin: null
            },
            token
        };
    } catch (error) {
        // Log error for debugging (in production, use proper logging)
        console.error('Register error:', error.message);
        throw error;
    }
};

module.exports = {
    login,
    register,
    verifyToken
};