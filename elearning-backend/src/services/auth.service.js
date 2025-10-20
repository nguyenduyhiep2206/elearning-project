// src/services/auth.service.js
require('dotenv').config();
console.log("JWT_SECRET =", process.env.JWT_SECRET);
const { users } = require('../models'); // Giả sử model User được export từ file models/User.js. Nếu là { users }, thì dùng users.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (email, password) => {
    try {
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
            role: user.role.toLowerCase()
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
                role: user.role.toLowerCase()
            },
            token
        };
    } catch (error) {
        throw error; // Ném lỗi lên layer trên để handle (ví dụ: trong controller)
    }
};

exports.register = async (fullName, email, password, confirmPassword) => {
    try {
        // 1. Kiểm tra xác nhận password có khớp không
        if (password !== confirmPassword) {
            throw new Error('Mật khẩu và xác nhận mật khẩu không khớp.');
        }

        // 2. Kiểm tra email đã tồn tại chưa
        const existingUser = await users.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email đã được sử dụng. Vui lòng chọn email khác.');
        }

        // 3. Hash password (sử dụng salt rounds = 12 cho an toàn)
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Tạo user mới (role mặc định là 'user', bạn có thể chỉnh)
        const newUser = await users.create({
            fullname: fullName,
            email: email,
            passwordhash: hashedPassword,
            role: 'Student'
        });

        // 5. Tạo JWT token tương tự login
        const tokenPayload = { 
            id: newUser.userid, 
            email: newUser.email, 
            role: newUser.role.toLowerCase()
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
            expiresIn: '1h'
        });

        // Trả về thông tin user (bỏ mật khẩu) và token
        return {
            user: {
                id: newUser.userid,
                fullName: newUser.fullname,
                email: newUser.email,
                role: newUser.role.toLowerCase()
            },
            token
        };
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        throw error;
    }
};