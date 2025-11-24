// src/middlewares/role.middleware.js

exports.isInstructor = (req, res, next) => {
  // Giả sử req.user đã được giải mã từ authMiddleware
  // req.user = { userid: 1, role: 'instructor', ... }
  
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  // Kiểm tra role (Sửa logic này tùy theo cách bạn lưu role trong DB: 'instructor', 'teacher' hay số 1, 2...)
  // Giả sử trong DB bạn lưu là 'instructor' hoặc 'admin'
  if (req.user.role === 'instructor' || req.user.role === 'admin' || req.user.role === 'teacher') {
    next(); // Cho phép đi tiếp
  } else {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Giáo viên.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên.' });
  }
};

// Nếu bạn muốn dùng cho Student
exports.isStudent = (req, res, next) => {
    next(); // Mặc định ai login rồi cũng là student, hoặc check logic riêng
};