// services/lesson.service.js

// 1. IMPORT THÊM 'courses' (để kiểm tra quyền sở hữu)
const { lessons, quizzes, courses } = require('../models');

// ==================================================
// 2. THÊM HÀM HELPER ĐỂ KIỂM TRA QUYỀN SỞ HỮU
// (Dùng logic y hệt như file chapter.service.js)
const checkCourseOwnership = async (courseId, teacherId) => {
  if (!courseId || !teacherId) {
    // Nếu Controller không gửi đủ 2 ID -> từ chối
    throw new Error('Permission denied');
  }

  // Tìm khóa học, chỉ lấy cột 'teacherid'
  const course = await courses.findByPk(courseId, { attributes: ['teacherid'] });

  // Nếu không tìm thấy khóa học (hoặc courseId bị giả mạo)
  if (!course) {
    throw new Error('Permission denied');
  }

  // Nếu ID giáo viên của khóa học KHÔNG KHỚP với ID của người đang request
  if (course.teacherid !== teacherId) {
    throw new Error('Permission denied');
  }

  // Nếu mọi thứ OK -> cho qua
  return true;
};
// ==================================================


// =======================================================
// KHÔNG THAY ĐỔI (API CÔNG KHAI)
// =======================================================

// Lấy tất cả bài học CỦA 1 CHƯƠNG
exports.getLessonsByChapter = async (chapterId) => {
  return await lessons.findAll({
    where: { chapterid: chapterId },
    order: [['sortorder', 'ASC']]
  });
};

// Lấy chi tiết 1 bài học (bao gồm nội dung, video, và quiz nếu có)
exports.getLessonById = async (id) => {
  return await lessons.findByPk(id, {
    include: [{ model: quizzes, as: 'quizzes' }]
  });
};

// =======================================================
// ĐÃ SỬA (API RIÊNG TƯ CỦA INSTRUCTOR)
// =======================================================

exports.createLesson = async (lessonData, teacherId) => {
  // lessonData phải bao gồm { title: "...", courseid: 1, chapterid: 1, ... }
  // Model 'lessons.js' của bạn có 'courseid' (NOT NULL), điều này rất tốt.
  const { courseid } = lessonData; // Lấy courseid từ dữ liệu

  // 3. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  await checkCourseOwnership(courseid, teacherId);

  // 4. Nếu kiểm tra qua (không văng lỗi), mới tiến hành tạo
  return await lessons.create(lessonData);
};

exports.updateLesson = async (id, lessonData, teacherId) => {
  // 1. Tìm bài học
  const lesson = await lessons.findByPk(id);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // 2. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  // Dùng lesson.courseid (courseid của bài học đang tồn tại) để kiểm tra
  await checkCourseOwnership(lesson.courseid, teacherId);
  
  // 3. Nếu qua, tiến hành cập nhật
  return await lesson.update(lessonData);
};

exports.deleteLesson = async (id, teacherId) => {
  // 1. Tìm bài học
  const lesson = await lessons.findByPk(id);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // 2. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  await checkCourseOwnership(lesson.courseid, teacherId);

  // 3. Nếu qua, tiến hành xóa
  return await lesson.destroy();
};