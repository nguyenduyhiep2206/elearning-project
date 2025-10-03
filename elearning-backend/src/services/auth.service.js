const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); // Thư viện để so sánh password hash
const jwt = require('jsonwebtoken'); // Thư viện tạo token

exports.login = async (email, password) => {
    // 1. Tìm user trong DB
    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
        { userId: user.userid, role: user.role },
        'YOUR_JWT_SECRET', // Lấy từ file .env
        { expiresIn: '1h' }
    );

    // Xóa password hash trước khi trả về thông tin user
    delete user.passwordhash;

    return { token, user };
};