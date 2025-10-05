// const authService = require('../services/auth.service');

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const { token, user } = await authService.login(email, password);
//         res.json({ message: "Đăng nhập thành công!", token, user });
//     } catch (error) {
//         next(error);
//     }
// };
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserService = require("../services/user.service");

class AuthController {
  // Đăng ký người dùng mới
  static async register(req, res) {
    try {
      const { email, password, role } = req.body;

      // Kiểm tra tồn tại
      const existing = await UserService.getUserByEmail(email);
      if (existing) return res.status(400).json({ error: "Email đã tồn tại" });

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Lưu user
      const newUser = await UserService.createUser(email, hashedPassword, role || "student");
      res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Đăng nhập
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: "User không tồn tại" });

      const isMatch = await bcrypt.compare(password, user.passwordhash);
      if (!isMatch) return res.status(400).json({ error: "Sai mật khẩu" });

      // Tạo token
      const token = jwt.sign(
        { userid: user.userid, email: user.email, role: user.role },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "1h" }
      );

      res.json({ token, role: user.role });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AuthController;


