const { teacherrequests, users, notifications } = require('../models');
const notificationService = require('./notification.service');

/**
 * Service xử lý các yêu cầu trở thành giảng viên
 */
class TeacherRequestService {
  /**
   * Tạo yêu cầu trở thành giảng viên
   * @param {number} userId - ID của user
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.bio - Giới thiệu bản thân
   * @param {string} data.teachingField - Lĩnh vực giảng dạy
   * @param {string} data.cvUrl - URL của CV
   * @param {Array<string>} data.certificateUrls - Mảng URL các chứng chỉ
   * @param {string} data.idCardUrl - URL của CCCD
   * @returns {Promise<Object>} - Teacher request object
   */
  async submitRequest(userId, data) {
    try {
      // Kiểm tra user đã có yêu cầu đang chờ duyệt chưa
      const existingPendingRequest = await teacherrequests.findOne({
        where: {
          userid: userId,
          status: 'Pending'
        }
      });

      if (existingPendingRequest) {
        throw new Error('Bạn đã có yêu cầu đang chờ duyệt. Vui lòng chờ phản hồi từ admin.');
      }

      // Cho phép gửi lại nếu yêu cầu trước đã bị từ chối (Rejected)
      // Không cần kiểm tra yêu cầu Rejected vì user có thể gửi lại

      // Kiểm tra user đã là teacher chưa
      const user = await users.findByPk(userId);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      if (user.role === 'teacher') {
        throw new Error('Bạn đã là giảng viên rồi');
      }

      // Lưu thông tin documents dưới dạng JSON trong certificateurl
      const documentsData = {
        cvUrl: data.cvUrl,
        certificateUrls: data.certificateUrls || [],
        idCardUrl: data.idCardUrl
      };

      // Tạo yêu cầu mới
      const request = await teacherrequests.create({
        userid: userId,
        requestdetails: data.bio, // Lưu bio vào requestdetails
        experience: data.bio, // Cũng lưu vào experience để tương thích
        specialization: data.teachingField, // Lưu lĩnh vực giảng dạy
        certificateurl: JSON.stringify(documentsData), // Lưu tất cả documents dưới dạng JSON
        status: 'Pending',
        submittedat: new Date()
      });

      // Gửi thông báo cho admin (tìm admin users)
      const adminUsers = await users.findAll({
        where: { role: 'admin' }
      });

      for (const admin of adminUsers) {
        await notificationService.createNotification(
          admin.userid,
          `Có yêu cầu trở thành giảng viên mới từ ${user.fullname}. Vui lòng kiểm tra và duyệt.`
        );
      }

      return request;
    } catch (error) {
      console.error('Error submitting teacher request:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả yêu cầu (cho admin)
   * @param {Object} filters - Bộ lọc
   * @param {string} filters.status - Trạng thái (Pending, Approved, Rejected)
   * @returns {Promise<Array>} - Danh sách yêu cầu
   */
  async getAllRequests(filters = {}) {
    try {
      const where = {};
      if (filters.status) {
        where.status = filters.status;
      }

      const requests = await teacherrequests.findAll({
        where,
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email', 'profilepicture', 'role']
          }
        ],
        order: [['submittedat', 'DESC']]
      });

      // Parse JSON data từ certificateurl
      return requests.map(request => {
        const requestData = request.toJSON();
        try {
          if (requestData.certificateurl) {
            requestData.documents = JSON.parse(requestData.certificateurl);
          } else {
            requestData.documents = {};
          }
        } catch (e) {
          requestData.documents = {};
        }
        return requestData;
      });
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw error;
    }
  }

  /**
   * Lấy yêu cầu theo ID
   * @param {number} requestId - ID của yêu cầu
   * @returns {Promise<Object>} - Teacher request object
   */
  async getRequestById(requestId) {
    try {
      const request = await teacherrequests.findByPk(requestId, {
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email', 'profilepicture', 'role']
          }
        ]
      });

      if (!request) {
        throw new Error('Không tìm thấy yêu cầu');
      }

      const requestData = request.toJSON();
      try {
        if (requestData.certificateurl) {
          requestData.documents = JSON.parse(requestData.certificateurl);
        } else {
          requestData.documents = {};
        }
      } catch (e) {
        requestData.documents = {};
      }

      return requestData;
    } catch (error) {
      console.error('Error getting request by ID:', error);
      throw error;
    }
  }

  /**
   * Lấy yêu cầu của user hiện tại
   * @param {number} userId - ID của user
   * @returns {Promise<Object|null>} - Teacher request object hoặc null
   */
  async getMyRequest(userId) {
    try {
      const request = await teacherrequests.findOne({
        where: { userid: userId },
        order: [['submittedat', 'DESC']],
        include: [
          {
            model: users,
            as: 'user',
            attributes: ['userid', 'fullname', 'email', 'profilepicture', 'role']
          }
        ]
      });

      if (!request) {
        return null;
      }

      const requestData = request.toJSON();
      try {
        if (requestData.certificateurl) {
          requestData.documents = JSON.parse(requestData.certificateurl);
        } else {
          requestData.documents = {};
        }
      } catch (e) {
        requestData.documents = {};
      }

      return requestData;
    } catch (error) {
      console.error('Error getting my request:', error);
      throw error;
    }
  }

  /**
   * Duyệt yêu cầu trở thành giảng viên
   * @param {number} requestId - ID của yêu cầu
   * @param {number} adminId - ID của admin duyệt
   * @returns {Promise<Object>} - Updated request
   */
  async approveRequest(requestId, adminId) {
    try {
      const request = await teacherrequests.findByPk(requestId, {
        include: [
          {
            model: users,
            as: 'user'
          }
        ]
      });

      if (!request) {
        throw new Error('Không tìm thấy yêu cầu');
      }

      if (request.status !== 'Pending') {
        throw new Error('Yêu cầu này đã được xử lý');
      }

      // Lấy user object để cập nhật
      const user = await users.findByPk(request.userid);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      // Cập nhật role của user thành teacher
      user.role = 'Teacher';
      await user.save();

      // Cập nhật trạng thái yêu cầu
      await request.update({
        status: 'Approved',
        reviewedat: new Date()
      });

      // Gửi thông báo cho user
      await notificationService.createNotification(
        request.userid,
        '🎉 Chúc mừng! Yêu cầu trở thành giảng viên của bạn đã được duyệt. Bây giờ bạn có thể tạo và quản lý khóa học.'
      );

      return request;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  /**
   * Từ chối yêu cầu trở thành giảng viên
   * @param {number} requestId - ID của yêu cầu
   * @param {number} adminId - ID của admin từ chối
   * @param {string} rejectionReason - Lý do từ chối
   * @returns {Promise<Object>} - Updated request
   */
  async rejectRequest(requestId, adminId, rejectionReason) {
    try {
      const request = await teacherrequests.findByPk(requestId, {
        include: [
          {
            model: users,
            as: 'user'
          }
        ]
      });

      if (!request) {
        throw new Error('Không tìm thấy yêu cầu');
      }

      if (request.status !== 'Pending') {
        throw new Error('Yêu cầu này đã được xử lý');
      }

      // Lưu lý do từ chối vào requestdetails (có thể tạo field riêng sau)
      const currentDetails = request.requestdetails || '';
      const updatedDetails = `${currentDetails}\n\n[Lý do từ chối: ${rejectionReason}]`;

      // Cập nhật trạng thái yêu cầu
      await request.update({
        status: 'Rejected',
        reviewedat: new Date(),
        requestdetails: updatedDetails
      });

      // Gửi thông báo cho user
      await notificationService.createNotification(
        request.userid,
        `Yêu cầu trở thành giảng viên của bạn đã bị từ chối. Lý do: ${rejectionReason}`
      );

      return request;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  /**
   * Đếm số yêu cầu đang chờ duyệt
   * @returns {Promise<number>} - Số lượng yêu cầu Pending
   */
  async getPendingCount() {
    try {
      return await teacherrequests.count({
        where: { status: 'Pending' }
      });
    } catch (error) {
      console.error('Error getting pending count:', error);
      throw error;
    }
  }
}

module.exports = new TeacherRequestService();

