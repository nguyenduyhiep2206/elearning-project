
const { users } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const login = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error('Email và mật khẩu là bắt buộc');
        }

        const user = await users.findOne({ 
            where: { 
                email: email.toLowerCase().trim() 
            } 
        });

        if (!user) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // Kiểm tra nếu user không có password (đăng ký bằng Google)
        if (!user.passwordhash) {
            throw new Error('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.passwordhash);

        if (!isPasswordMatch) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

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

        // Không cần cập nhật lastlogin vì model không có field này

        return {
            user: {
                id: user.userid,
                fullName: user.fullname,
                email: user.email,
                role: user.role,
                createdAt: user.createdat
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

        // Kiểm tra user còn tồn tại
        const user = await users.findOne({ 
            where: { 
                userid: decoded.userId
            } 
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại');
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
            role: 'Student', // PascalCase để phù hợp với database
            provider: 'local'
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
                createdAt: newUser.createdat
            },
            token
        };
    } catch (error) {
        // Log error for debugging (in production, use proper logging)
        console.error('Register error:', error.message);
        throw error;
    }
};



const loginWithGoogle = async (googleProfile) => {
  const email = googleProfile.emails?.[0]?.value;

  if (!email) throw new Error("Google không trả về email");

  let user = await users.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    // Tạo user mới từ Google
    const displayName = googleProfile.displayName || 
      (googleProfile.name?.givenName && googleProfile.name?.familyName 
        ? `${googleProfile.name.givenName} ${googleProfile.name.familyName}` 
        : 'User');
    
    user = await users.create({
      fullname: displayName,
      email: email.toLowerCase().trim(),
      passwordhash: null,
      role: "Student", // PascalCase để phù hợp với database
      provider: "google",
      googleid: googleProfile.id?.toString() || null,
      profilepicture: googleProfile.photos?.[0]?.value || null,
    });

    // Tạo token cho user mới
    const token = jwt.sign(
      {
        userId: user.userid,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || "fallback-secret-key-for-development",
      {
        expiresIn: "1h",
        issuer: "elearning-app",
        audience: "elearning-users",
      }
    );

    return {
      isNew: true,
      token,
      user: {
        id: user.userid,
        fullName: user.fullname,
        email: user.email,
        role: user.role,
        profilepicture: user.profilepicture,
      },
    };
  }

  if (user.provider === "local") {
    throw new Error(
      "Email này đã được đăng ký bằng mật khẩu. Hãy dùng đăng nhập truyền thống."
    );
  }

  // Cập nhật profile picture nếu có
  if (googleProfile.photos?.[0]?.value) {
    await user.update({
      profilepicture: googleProfile.photos[0].value,
    });
  }

  const token = jwt.sign(
    {
      userId: user.userid,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET || "fallback-secret-key-for-development",
    {
      expiresIn: "1h",
      issuer: "elearning-app",
      audience: "elearning-users",
    }
  );

  return {
    isNew: false,
    token,
    user: {
      id: user.userid,
      fullName: user.fullname,
      email: user.email,
      role: user.role,
      profilepicture: user.profilepicture,
    },
  };
};


module.exports = {
    login,
    register,
    verifyToken,loginWithGoogle
};