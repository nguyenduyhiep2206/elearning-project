// Giả sử bạn có một file cấu hình kết nối db như thế này
const pool = require('../config/db.config.js'); 

const User = {};

// Hàm tìm user bằng email (dùng cho chức năng đăng nhập)
User.findByEmail = async (email) => {
    const query = {
        text: 'SELECT * FROM Users WHERE Email = $1',
        values: [email],
    };
    const { rows } = await pool.query(query);
    return rows[0];
};

// Hàm tìm user bằng ID
User.findById = async (id) => {
    const query = {
        text: 'SELECT UserID, FullName, Email, Role, ProfilePicture FROM Users WHERE UserID = $1',
        values: [id],
    };
    const { rows } = await pool.query(query);
    return rows[0];
};

// Hàm tạo user mới (dùng cho chức năng đăng ký)
User.create = async (fullName, email, passwordHash, role) => {
    const query = {
        text: 'INSERT INTO Users (FullName, Email, PasswordHash, Role) VALUES ($1, $2, $3, $4) RETURNING *',
        values: [fullName, email, passwordHash, role],
    };
    const { rows } = await pool.query(query);
    return rows[0];
};

// Hàm lấy danh sách user với phân trang
User.findAll = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    // Câu lệnh này vừa lấy dữ liệu trang hiện tại, vừa đếm tổng số dòng
    const query = {
        text: `SELECT UserID, FullName, Email, Role, CreatedAt, COUNT(*) OVER() AS total_count 
               FROM Users 
               ORDER BY UserID 
               LIMIT $1 OFFSET $2`,
        values: [limit, offset],
    };
    const { rows } = await pool.query(query);
    return rows;
};
// ... Thêm các hàm khác như update, delete nếu cần

module.exports = User;