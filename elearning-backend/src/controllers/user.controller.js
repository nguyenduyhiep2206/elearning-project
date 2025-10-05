// const userService = require('../../services/user.service');

// exports.getAllUsers = async (req, res, next) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const { users, totalItems } = await userService.getAllUsers(page, limit);

//         res.json({
//             message: "Lấy danh sách người dùng thành công!",
//             data: users,
//             pagination: {
//                 page,
//                 limit,
//                 totalItems,
//                 totalPages: Math.ceil(totalItems / limit)
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// };
const UserService = require("../services/user.service");

class UserController {
  static async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User không tồn tại" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const updated = await UserService.updateUser(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      res.json({ message: "Xóa user thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = UserController;
