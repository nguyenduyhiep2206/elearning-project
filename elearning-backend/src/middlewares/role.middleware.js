
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Truy cập bị từ chối. Yêu cầu một trong các quyền: ${allowedRoles.join(', ')}.` 
            });
        }
        next();
    }
};

module.exports = authorizeRole;