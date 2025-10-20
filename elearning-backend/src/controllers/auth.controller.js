
const authService = require('../services/auth.service');

// Hàm helper validation email đơn giản
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validation thủ công cho login
const validateLogin = (reqBody) => {
    const { email, password } = reqBody;
    if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc.');
    }
    if (!isValidEmail(email)) {
        throw new Error('Email không hợp lệ.');
    }
    if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }
};

// Validation thủ công cho register
const validateRegister = (reqBody) => {
    const { fullName, email, password, confirmPassword } = reqBody;
    if (!fullName || !email || !password || !confirmPassword) {
        throw new Error('Tất cả các trường là bắt buộc.');
    }
    if (fullName.length < 2 || fullName.length > 50) {
        throw new Error('Họ tên phải có từ 2 đến 50 ký tự.');
    }
    if (!isValidEmail(email)) {
        throw new Error('Email không hợp lệ.');
    }
    if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    if (password !== confirmPassword) {
        throw new Error('Mật khẩu và xác nhận mật khẩu không khớp.');
    }
};

exports.login = async (req, res, next) => {
    try {
        // Validation input thủ công
        validateLogin(req.body);

        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);
        
        res.status(200).json({ 
            message: "Đăng nhập thành công!", 
            token, 
            user 
        });
    } catch (error) {
        // Log lỗi nếu cần (console.error(error);)
        next(error); // Pass lên error middleware
    }
};

exports.register = async (req, res, next) => {
    try {
        // Validation input thủ công
        validateRegister(req.body);

        const { fullName, email, password, confirmPassword } = req.body;
        const { token, user } = await authService.register(fullName, email, password, confirmPassword);
        
        res.status(201).json({ 
            message: "Đăng ký thành công! Bạn có thể đăng nhập ngay.", 
            token, 
            user 
        });
    } catch (error) {
        // Log lỗi nếu cần
        next(error);
    }
};