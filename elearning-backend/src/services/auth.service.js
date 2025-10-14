// src/services/auth.service.js

const { users } = require('../models'); // Đảm bảo bạn import đúng model User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (email, password) => {
    // 1. Tìm người dùng bằng email
    const user = await users.findOne({ where: { email } });

    // 2. Nếu không tìm thấy người dùng, báo lỗi
    if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    // 3. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
    const isPasswordMatch = await bcrypt.compare(password, user.passwordhash);

    // 4. Nếu mật khẩu không khớp, báo lỗi
    if (!isPasswordMatch) {
        throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    // 5. Nếu mọi thứ chính xác, tạo JWT token
    const tokenPayload = { 
        id: user.userid, 
        email: user.email, 
        role: user.role 
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
        expiresIn: '1h' // Token hết hạn sau 1 giờ
    });

    // Trả về thông tin người dùng (bỏ mật khẩu) và token
    return {
        user: {
            id: user.userid,
            fullName: user.fullname,
            email: user.email,
            role: user.role
        },
        token
    };
};