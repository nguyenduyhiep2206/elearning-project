const models = require('../models');  // Load từ index.js
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const UserModel = models.users;  // Alias cho users
const UserDetailsModel = models.userdetails;  // Alias cho UserDetails

// Debug tạm: Kiểm tra model
if (!UserModel) {
  throw new Error('UserModel not loaded - check models/index.js');
}

exports.getAllUsers = async (page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // Lấy total count riêng (không dùng raw query phức tạp)
        const totalItems = await UserModel.count();

        // Lấy data với pagination
        const usersData = await UserModel.findAll({
            limit,
            offset,
            attributes: { exclude: ['passwordhash'] }  // Bỏ password
        });

        if (usersData.length === 0) {
            return { users: [], totalItems: 0 };
        }

        return { users: usersData, totalItems };
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách users: ${error.message}`);
    }
};

exports.createUser = async (userData) => {
    try {
        const { fullname, email, password, role = 'Student' } = userData;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email đã tồn tại. Vui lòng chọn email khác.');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Tạo user mới
        const newUser = await UserModel.create({
            fullname,
            email,
            passwordhash: hashedPassword,
            role
        });

        // Tạo UserDetails mặc định nếu cần
        await UserDetailsModel.create({ userid: newUser.userid });

        // Trả về user không có password
        const { passwordhash, ...user } = newUser.toJSON();
        return user;
    } catch (error) {
        throw new Error(`Lỗi khi tạo user: ${error.message}`);
    }
};

exports.updateUser = async (id, updateData) => {
    try {
        const user = await UserModel.findByPk(id);
        if (!user) {
            throw new Error('User không tồn tại.');
        }

        // Nếu cập nhật password, hash lại
        if (updateData.password) {
            const saltRounds = 12;
            updateData.passwordhash = await bcrypt.hash(updateData.password, saltRounds);
            delete updateData.password;
        }

        // Cập nhật
        await user.update(updateData);

        // Trả về user cập nhật (không có password)
        const { passwordhash, ...updatedUser } = user.toJSON();
        return updatedUser;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật user: ${error.message}`);
    }
};

exports.deleteUser = async (id) => {
    try {
        const user = await UserModel.findByPk(id);
        if (!user) {
            throw new Error('User không tồn tại.');
        }

        // Xóa UserDetails liên quan nếu có
        await UserDetailsModel.destroy({ where: { userid: id } });

        await user.destroy();
        return { message: 'Xóa user thành công.' };
    } catch (error) {
        throw new Error(`Lỗi khi xóa user: ${error.message}`);
    }
};

exports.uploadProfileImage = async (userId, file) => {
    try {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Tạo tên file unique
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        // Lưu file (giả sử file từ multer có buffer hoặc path)
        fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));

        // Update UserDetails
        let details = await UserDetailsModel.findOne({ where: { userid: userId } });
        if (!details) {
            details = await UserDetailsModel.create({ userid: userId });
        }

        // Xóa ảnh cũ nếu có
        if (details.profileImage) {
            const oldPath = path.join(__dirname, '../../public', details.profileImage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await details.update({ profileImage: `/uploads/profiles/${fileName}` });

        return { message: 'Upload ảnh profile thành công.', profileImage: `/uploads/profiles/${fileName}` };
    } catch (error) {
        throw new Error(`Lỗi khi upload ảnh: ${error.message}`);
    }
};

exports.getUserDetails = async (userId) => {
    try {
        const user = await UserModel.findOne({
            where: { userid: userId },
            include: [
                {
                    model: UserDetailsModel,
                    as: 'details' 
                }
            ],
            attributes: { 
                exclude: ['passwordhash']  
            }
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        const userData = {
            ...user.toJSON(),
            details: user.details ? user.details.toJSON() : null
        };

        return userData;
    } catch (error) {
        throw new Error(`Lỗi khi lấy chi tiết người dùng: ${error.message}`);
    }
};

exports.approveTeacherRequest = async (userId, approved = true) => {
    try {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại.');
        }

        const details = await UserDetailsModel.findOne({ where: { userid: userId } });
        if (!details) {
            throw new Error('Thông tin chi tiết người dùng không tồn tại.');
        }

        if (details.approvalstatus !== 'Pending') {
            throw new Error('Yêu cầu không đang chờ phê duyệt.');
        }

        const status = approved ? 'Approved' : 'Rejected';
        await details.update({ approvalstatus: status });

        if (approved) {
            await user.update({ role: 'Teacher' });  // Cập nhật role thành Teacher
            return { message: 'Phê duyệt yêu cầu làm giáo viên thành công.' };
        } else {
            await user.update({ role: 'Student' });  // Hoặc 'user'
            return { message: 'Từ chối yêu cầu làm giáo viên thành công.' };
        }
    } catch (error) {
        throw new Error(`Lỗi khi xử lý yêu cầu: ${error.message}`);
    }
};