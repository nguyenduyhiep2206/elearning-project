const authService = require('../services/auth.service');
const { users } = require('../models');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ',
            });
        }

        const { token, user } = await authService.login(email, password);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: user.role,
            }, 
        });
    } catch (error) {
        console.error('Login controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi server.',
        });
    }
};

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên, email và mật khẩu là bắt buộc',
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
            });
        }

        const { token, user } = await authService.register(fullName, email, password);

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: { user, token },
        });
    } catch (error) {
        console.error('Register controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi server.',
        });
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('authToken');
        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đăng xuất',
        });
    }
};

const verifyAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp',
      });
    }

    const decoded = await authService.verifyToken(token);

    // Lấy đầy đủ thông tin user từ database để có id và profilepicture
    const user = await users.findByPk(decoded.userId, {
      attributes: ['userid', 'fullname', 'email', 'role', 'profilepicture', 'createdat'],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token hợp lệ',
      data: {
        user: {
          id: user.userid,
          fullName: user.fullname,
          email: user.email,
          role: user.role,
          profilepicture: user.profilepicture,
          createdAt: user.createdat,
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token không hợp lệ',
    });
  }
};


const googleCallback = async (req, res) => {
  try {
    const googleProfile = req.user; 
    const result = await authService.loginWithGoogle(googleProfile);

    // Cả user mới và user cũ đều có token, redirect với token
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${result.token}&role=${result.user.role}${result.isNew ? '&registered=1' : ''}`
    );
  } catch (err) {
    console.error("Google Login Error:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
        err.message
      )}`
    );
  }
};


// const facebookCallback = async (req, res) => {
//     try {
//         const user = req.user;

//         const token = jwt.sign(
//             { id: user._id, email: user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
//     } catch (error) {
//         console.error('Facebook callback error:', error.message);
//         res.redirect(`${process.env.FRONTEND_URL}/login-failed`);
//     }
// };

module.exports = {
    login,
    register,
    logout,
    verifyAuth,
    googleCallback,
    // facebookCallback,
};
