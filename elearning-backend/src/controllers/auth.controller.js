const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);
        res.json({ message: "Đăng nhập thành công!", token, user });
    } catch (error) {
        next(error);
    }
};