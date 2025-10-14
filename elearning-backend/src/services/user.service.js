const User = require('../models/users');

exports.getAllUsers = async (page, limit) => {
    const usersData = await User.findAll(page, limit);
    if (usersData.length === 0) {
        return { users: [], totalItems: 0 };
    }

    const totalItems = usersData[0].total_count; // Lấy tổng số lượng từ dòng đầu tiên
    // Xóa cột total_count khỏi dữ liệu trả về
    const users = usersData.map(({ total_count, ...rest }) => rest);

    return { users, totalItems };
};