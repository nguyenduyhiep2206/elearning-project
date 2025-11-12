// services/chapter.service.js

// 1. IMPORT THÊM 'courses' (để kiểm tra quyền sở hữu)
const { chapters, lessons, courses } = require('../models');

// ==================================================
// 2. THÊM HÀM HELPER ĐỂ KIỂM TRA QUYỀN SỞ HỮU
// (Hàm logic mới mà chúng ta đã nói)
const checkCourseOwnership = async (courseId, teacherId) => {
  if (!courseId || !teacherId) {
    // Nếu Controller không gửi đủ 2 ID -> từ chối
    throw new Error('Permission denied');
  }

  // Tìm khóa học, chỉ lấy cột 'teacherid'
  const course = await courses.findByPk(courseId, { attributes: ['teacherid'] });

  // Nếu không tìm thấy khóa học
  if (!course) {
    // Controller sẽ bắt lỗi này và trả về 403 (vì courseId có thể bị giả mạo)
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

// Lấy tất cả chương học CỦA 1 KHÓA HỌC
exports.getChaptersByCourse = async (courseId) => {
  return await chapters.findAll({
    where: { courseid: courseId },
    include: [{ model: lessons, as: 'lessons', attributes: ['lessonid', 'title'] }],
    order: [['sortorder', 'ASC']]
  });
};

exports.getChapterById = async (id) => {
  return await chapters.findByPk(id, {
    include: [{ model: lessons, as: 'lessons', order: [['sortorder', 'ASC']] }]
  });
};


// =======================================================
// ĐÃ SỬA (API RIÊNG TƯ CỦA INSTRUCTOR)
// =======================================================

exports.createChapter = async (chapterData, teacherId) => {
  // chapterData phải bao gồm { title: "...", courseid: 1, ... }
  const { courseid } = chapterData; // Lấy courseid từ dữ liệu

  // 3. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  await checkCourseOwnership(courseid, teacherId);

  // 4. Nếu kiểm tra qua (không văng lỗi), mới tiến hành tạo
  return await chapters.create(chapterData);
};

exports.updateChapter = async (id, chapterData, teacherId) => {
  // 1. Tìm chương học
  const chapter = await chapters.findByPk(id);
  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // 2. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  // Dùng chapter.courseid (courseid của chương đang tồn tại) để kiểm tra
  await checkCourseOwnership(chapter.courseid, teacherId);
  
  // 3. Nếu qua, tiến hành cập nhật
  return await chapter.update(chapterData);
};

exports.deleteChapter = async (id, teacherId) => {
  // 1. Tìm chương học
  const chapter = await chapters.findByPk(id);
  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // 2. KIỂM TRA QUYỀN SỞ HỮU (Dòng bảo mật mới)
  await checkCourseOwnership(chapter.courseid, teacherId);

  // 3. Nếu qua, tiến hành xóa
  // Cần xử lý xóa/di chuyển các bài học con trước khi xóa chương (hoặc set ON DELETE CASCADE)
  return await chapter.destroy();
};