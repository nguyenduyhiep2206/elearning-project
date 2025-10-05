const jwt = require("jsonwebtoken");

// Xác thực token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded; // chứa userID, email, Role,...
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
}

// Phân quyền linh hoạt theo vai trò
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.Role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRoles,
};
