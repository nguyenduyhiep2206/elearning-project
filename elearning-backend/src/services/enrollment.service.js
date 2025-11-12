const { enrollments, courses, sequelize } = require('../models');

class EnrollmentService {
  /**
   * Đăng ký học viên vào khóa học
   * @param {number} studentId - ID của học viên
   * @param {number} courseId - ID của khóa học
   * @returns {Promise<object>}
   */
  async createEnrollment(studentId, courseId) {
    // Sử dụng transaction để đảm bảo cả hai hành động (tạo enrollment VÀ cập nhật count)
    // hoặc cùng thành công, hoặc cùng thất bại.
    const t = await sequelize.transaction();

    try {
      // 1. Kiểm tra xem học viên đã đăng ký khóa này chưa
      const existingEnrollment = await enrollments.findOne({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
        transaction: t,
      });

      if (existingEnrollment) {
        throw new Error('Bạn đã đăng ký khóa học này rồi');
      }

      // 2. Tạo bản ghi đăng ký mới
      const newEnrollment = await enrollments.create(
        {
          studentid: studentId,
          courseid: courseId,
        },
        { transaction: t }
      );

      // 3. Tăng số lượng đăng ký trong bảng 'courses'
      // Đây là hàm an toàn, tự động làm:
      // UPDATE "courses" SET "enrollmentcount" = "enrollmentcount" + 1 WHERE "courseid" = ...
      await courses.increment('enrollmentcount', {
        by: 1,
        where: { courseid: courseId },
        transaction: t,
      });

      // 4. Nếu mọi thứ thành công, commit transaction
      await t.commit();

      return newEnrollment;
    } catch (error) {
      // 5. Nếu có bất kỳ lỗi nào, rollback tất cả
      await t.rollback();
      console.error('Error in createEnrollment:', error);
      throw new Error(`Lỗi khi đăng ký khóa học: ${error.message}`);
    }
  }

  // (Bạn có thể thêm các hàm khác như getEnrollmentsByStudent, getEnrollmentsByCourse...)
}

module.exports = new EnrollmentService();