const userService = require('../services/user.service');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const apiResponse = require('../utils/apiResponse');

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
        // Đảm bảo thư mục tồn tại trước khi lưu file
        const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'profiles');
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (err) {
            console.error('Error ensuring upload directory exists:', err);
            cb(err, uploadDir);
        }
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

// Lấy thông tin user theo ID (user có thể xem thông tin của chính mình)
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user.userid;
        
        // User chỉ có thể xem thông tin của chính mình (trừ admin)
        if (parseInt(id) !== parseInt(userId) && req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ 
                message: 'Bạn không có quyền xem thông tin người dùng này.' 
            });
        }
        
        const userData = await userService.getUserDetails(id);
        
        res.status(200).json({ 
            success: true,
            message: 'Lấy thông tin người dùng thành công.', 
            data: userData 
        });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết thông tin người dùng (cho admin)
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

exports.updateWalletAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return apiResponse.validationError(res, {
                walletAddress: 'Wallet address là bắt buộc'
            }, 'Thiếu thông tin bắt buộc');
        }

        // Validate wallet address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return apiResponse.validationError(res, {
                walletAddress: 'Địa chỉ ví không hợp lệ. Phải là địa chỉ Ethereum hợp lệ (0x...)'
            }, 'Địa chỉ ví không hợp lệ');
        }

        const updatedUser = await userService.updateWalletAddress(userId, walletAddress);

        return apiResponse.success(
            res,
            updatedUser,
            'Đã cập nhật địa chỉ ví thành công'
        );
    } catch (error) {
        // Chỉ log trong development mode
        if (process.env.NODE_ENV !== 'production') {
            console.error('Lỗi khi cập nhật wallet address:', error);
        }
        
        // Xử lý lỗi wallet đã được sử dụng
        if (error.message && error.message.includes('đã được sử dụng bởi tài khoản khác')) {
            return apiResponse.error(
                res,
                error.message,
                409 // Conflict
            );
        }
        
        // Trả về message lỗi cho người dùng (bỏ prefix "Lỗi khi cập nhật wallet address: " nếu có)
        let errorMessage = error.message || 'Lỗi khi cập nhật địa chỉ ví';
        if (errorMessage.includes('Lỗi khi cập nhật wallet address: ')) {
            errorMessage = errorMessage.replace('Lỗi khi cập nhật wallet address: ', '');
        }
        
        return apiResponse.error(res, errorMessage, 500);
    }
};
