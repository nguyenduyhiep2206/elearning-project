const userService = require('../../services/user.service');

exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { users, totalItems } = await userService.getAllUsers(page, limit);

        res.json({
            message: "Lấy danh sách người dùng thành công!",
            data: users,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};