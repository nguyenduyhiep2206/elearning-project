// const User = require('../models/user.model');

// exports.getAllUsers = async (page, limit) => {
//     const usersData = await User.findAll(page, limit);
//     if (usersData.length === 0) {
//         return { users: [], totalItems: 0 };
//     }

//     const totalItems = usersData[0].total_count; // Lấy tổng số lượng từ dòng đầu tiên
//     // Xóa cột total_count khỏi dữ liệu trả về
//     const users = usersData.map(({ total_count, ...rest }) => rest);

//     return { users, totalItems };
// };
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

class UserService {
  static async getAllUsers() {
    return await User.findAll();
  }

  static async getUserById(id) {
    return await User.findById(id);
  }

  static async register({ fullname, email, password, role, profilepicture }) {
    const existing = await User.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const passwordhash = await bcrypt.hash(password, 10);
    return await User.create({ fullname, email, passwordhash, role, profilepicture });
  }

  static async updateUser(id, data) {
    return await User.update(id, data);
  }

  static async deleteUser(id) {
    return await User.delete(id);
  }
}

module.exports = UserService;
