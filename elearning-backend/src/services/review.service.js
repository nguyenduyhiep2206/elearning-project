const { coursereviews, users, enrollments, orders, orderdetails } = require('../models');

/**
 * Kiểm tra xem học viên đã đăng ký khóa học chưa
 * Kiểm tra cả enrollments và orders (status = Completed)
 */
const checkEnrollment = async (studentId, courseId) => {
  // Kiểm tra trong enrollments
  const enrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    }
  });

  if (enrollment) {
    return true;
  }

  // Kiểm tra trong orders với status = Completed
  const orderDetail = await orderdetails.findOne({
    where: {
      courseid: courseId,
    },
    include: [
      {
        model: orders,
        as: 'order',
        where: {
          userid: studentId,
          status: 'Completed',
        },
        required: true,
      },
    ],
  });

  return !!orderDetail;
};

/**
 * Tạo một đánh giá mới cho khóa học.
 */
const createReview = async (studentId, courseId, rating, comment) => {
  // 1. Kiểm tra xem học viên đã đăng ký khóa học này chưa
  const isEnrolled = await checkEnrollment(studentId, courseId);

  if (!isEnrolled) {
    throw new Error('Bạn phải đăng ký khóa học trước khi có thể đánh giá.');
  }

  // 2. Kiểm tra xem học viên đã đánh giá khóa học này chưa
  const existingReview = await coursereviews.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    }
  });

  if (existingReview) {
      throw new Error('Bạn đã đánh giá khóa học này rồi. Vui lòng sửa đánh giá hiện có.');
  }

  // 3. Tạo đánh giá mới
  const newReview = await coursereviews.create({
    studentid: studentId,
    courseid: courseId,
    rating,
    comment,
  });

  // Lấy review với thông tin student
  const reviewWithStudent = await coursereviews.findByPk(newReview.reviewid, {
    include: [{
      model: users,
      as: 'student',
      attributes: ['fullname', 'profilepicture'],
    }],
  });

  return reviewWithStudent;
};

/**
 * Cập nhật đánh giá của học viên cho khóa học.
 */
const updateReview = async (studentId, courseId, rating, comment) => {
  // 1. Kiểm tra xem học viên đã đăng ký khóa học này chưa
  const isEnrolled = await checkEnrollment(studentId, courseId);

  if (!isEnrolled) {
    throw new Error('Bạn phải đăng ký khóa học trước khi có thể đánh giá.');
  }

  // 2. Tìm đánh giá hiện có
  const existingReview = await coursereviews.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    }
  });

  if (!existingReview) {
    throw new Error('Bạn chưa đánh giá khóa học này. Vui lòng tạo đánh giá mới.');
  }

  // 3. Cập nhật đánh giá
  await existingReview.update({
    rating,
    comment,
  });

  // Lấy review đã cập nhật với thông tin student
  const updatedReview = await coursereviews.findByPk(existingReview.reviewid, {
    include: [{
      model: users,
      as: 'student',
      attributes: ['fullname', 'profilepicture'],
    }],
  });

  return updatedReview;
};

/**
 * Lấy đánh giá của học viên cho một khóa học.
 */
const getUserReview = async (studentId, courseId) => {
  const review = await coursereviews.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    },
    include: [{
      model: users,
      as: 'student',
      attributes: ['fullname', 'profilepicture'],
    }],
  });

  return review;
};

/**
 * Lấy tất cả đánh giá của một khóa học.
 */
const getReviewsByCourseId = async (courseId) => {
  return await coursereviews.findAll({
    where: { courseid: courseId },
    include: [{
      model: users,
      as: 'student', // Phải khớp với alias trong init-models.js
      attributes: ['fullname', 'profilepicture'], // Chỉ lấy thông tin cần thiết của người dùng
    }],
    order: [['createdat', 'DESC']],
  });
};

module.exports = {
  createReview,
  updateReview,
  getUserReview,
  getReviewsByCourseId,
  checkEnrollment,
};