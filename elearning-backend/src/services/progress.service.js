// services/progress.service.js

// 1. IMPORT THÊM 'certificates'
const {lessonprogress,lessons,coursecompletions,certificates,} = require('../models');

// =======================================================
// HÀM LOGIC MỚI: TỰ ĐỘNG KIỂM TRA HOÀN THÀNH (ĐÃ SỬA)
// =======================================================
/**
 * Tự động kiểm tra hoàn thành khóa học VÀ tạo chứng chỉ.
 * @param {number} studentId - ID học viên
 * @param {number} courseId - ID khóa học
 */
const checkAndCreateCourseCompletion = async (studentId, courseId) => {
  try {
    // Bước 1: Kiểm tra xem học viên này đã được ghi nhận là hoàn thành khóa học chưa
    const existingCompletion = await coursecompletions.findOne({
      where: {
        studentid: studentId,
        courseid: courseId,
      },
    });

    // Nếu đã hoàn thành rồi -> không cần làm gì cả
    if (existingCompletion) {
      return;
    }

    // Bước 2: Đếm TỔNG SỐ bài học của khóa học này
    const totalLessonsInCourse = await lessons.count({
      where: { courseid: courseId },
    });

    if (totalLessonsInCourse === 0) return; // Khóa học không có bài học

    // Bước 3: Đếm SỐ BÀI HỌC ĐÃ HOÀN THÀNH của học viên
    const completedLessonsCount = await lessonprogress.count({
      where: {
        studentid: studentId,
        iscompleted: true,
      },
      include: [
        {
          model: lessons,
          as: 'lesson',
          where: { courseid: courseId },
          attributes: [],
          required: true,
        },
      ],
    });

    // Bước 4: So sánh
    if (completedLessonsCount >= totalLessonsInCourse) {
      // ======== BƯỚC A: TẠO COURSE COMPLETION ========
      // (Như đã làm ở bước trước)
      const newCompletion = await coursecompletions.create({
        studentid: studentId,
        courseid: courseId,
        completedat: new Date(),
      });
      console.log(`Student ${studentId} completed course ${courseId}!`);

      // ======== BƯỚC B: TẠO CERTIFICATE (LOGIC MỚI) ========
      if (newCompletion) {
        // Kiểm tra xem chứng chỉ đã tồn tại chưa (để phòng hờ)
        const existingCertificate = await certificates.findOne({
          where: {
            studentid: studentId,
            courseid: courseId,
          },
        });

        // Nếu chưa có chứng chỉ -> tạo mới
        if (!existingCertificate) {
          await certificates.create({
            studentid: studentId,
            courseid: courseId,
            issuedat: new Date(),
          });
          console.log(`Certificate issued for student ${studentId} on course ${courseId}.`);
        }
      }
      // ======== KẾT THÚC BƯỚC B ========
    }
  } catch (error) {
    // Tác vụ nền lỗi -> chỉ log, không văng lỗi ra ngoài
    console.error('Error in checkAndCreateCourseCompletion:', error);
  }
};

// =======================================================
// CÁC HÀM CŨ (KHÔNG ĐỔI)
// =======================================================

exports.markLessonCompleted = async (studentId, lessonId) => {
  // 1. Kiểm tra xem bài học có tồn tại không
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const courseId = lesson.courseid;

  // 2. Tìm hoặc Tạo mới (findOrCreate) bản ghi tiến độ
  const [progress, created] = await lessonprogress.findOrCreate({
    where: {
      studentid: studentId,
      lessonid: lessonId,
    },
    defaults: {
      iscompleted: true,
      completedat: new Date(),
    },
  });

  let wasJustCompleted = false;

  // 3. Nếu bản ghi đã tồn tại nhưng chưa hoàn thành, update nó
  if (!created && !progress.iscompleted) {
    await progress.update({
      iscompleted: true,
      completedat: new Date(),
    });
    wasJustCompleted = true;
  }

  // 4. Nếu vừa TẠO MỚI hoặc vừa CẬP NHẬT -> kích hoạt kiểm tra
  if (created || wasJustCompleted) {
    // GỌI HÀM KIỂM TRA TỰ ĐỘNG (KHÔNG cần await)
    checkAndCreateCourseCompletion(studentId, courseId);
  }

  // 5. Trả về bản ghi tiến độ ngay lập tức
  return progress;
};

// Lấy tiến độ của một học viên trong 1 khóa học (Giữ nguyên)
exports.getCourseProgress = async (studentId, courseId) => {
  const completedLessons = await lessonprogress.findAll({
    where: {
      studentid: studentId,
      iscompleted: true,
    },
    include: [
      {
        model: lessons,
        as: 'lesson',
        where: { courseid: courseId },
        attributes: ['lessonid'],
      },
    ],
    attributes: ['lessonid'],
  });

  // Trả về một mảng các ID bài học đã hoàn thành
  return completedLessons.map((p) => p.lesson.lessonid);
};