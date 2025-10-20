
const authorizeRole = (allowedRoles) => {
    // Middleware factory: nhận array roles cho phép, trả về middleware
    return (req, res, next) => {
        // Chạy sau authMiddleware, nên req.user đã tồn tại
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Truy cập bị từ chối. Yêu cầu một trong các quyền: ${allowedRoles.join(', ')}.` 
            });
        }
        next();
    }
};

module.exports = authorizeRole;