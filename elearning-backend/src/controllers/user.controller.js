const userService = require('../services/user.service');
const multer = require('multer');  // ← Thêm dòng này!
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
exports.createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ message: 'Tạo user thành công.', user });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);
        res.status(200).json({ message: 'Cập nhật user thành công.', user });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.status(200).json({ message: 'Xóa user thành công.' });
    } catch (error) {
        next(error);
    }
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
    }
});

// ... (các hàm cũ)

// Upload ảnh profile (single file)
exports.uploadProfileImage = async (req, res, next) => {
    try {
        upload.single('profileImage')(req, res, async (err) => {
            if (err) {
                return next(err);
            }
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
            }

            const userId = req.user.id; // Từ auth middleware
            const result = await userService.uploadProfileImage(userId, req.file);
            res.status(200).json(result);
        });
    } catch (error) {
        next(error);
    }
};
// Lấy chi tiết thông tin người dùng
exports.getUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params; // userId từ params (:id)
        const userData = await userService.getUserDetails(id);
        
        res.status(200).json({ 
            message: 'Lấy chi tiết người dùng thành công.', 
            user: userData 
        });
    } catch (error) {
        next(error);
    }
};
exports.approveTeacherRequest = async (req, res, next) => {
    try {
        const { id } = req.params; // userId từ params
        const { approved } = req.body; // true/false từ body
        const result = await userService.approveTeacherRequest(id, approved);
        
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};