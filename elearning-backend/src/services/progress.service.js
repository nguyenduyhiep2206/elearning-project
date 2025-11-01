// services/progress.service.js
const { lessonprogress, lessons } = require('../models');

exports.markLessonCompleted = async (studentId, lessonId) => {
  // 1. Kiểm tra xem bài học có tồn tại không
  const lesson = await lessons.findByPk(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  // 2. Tìm hoặc Tạo mới (findOrCreate) bản ghi tiến độ
  const [progress, created] = await lessonprogress.findOrCreate({
    where: {
      studentid: studentId,
      lessonid: lessonId
    },
    defaults: {
      iscompleted: true,
      completedat: new Date()
    }
  });

  // 3. Nếu bản ghi đã tồn tại nhưng chưa hoàn thành, update nó
  if (!created && !progress.iscompleted) {
    await progress.update({
      iscompleted: true,
      completedat: new Date()
    });
  }

  // 4. Trả về bản ghi tiến độ
  // HOOK (ở Bước 1) sẽ tự động kích hoạt nếu iscompleted chuyển từ false -> true
  return progress;
};

// Lấy tiến độ của một học viên trong 1 khóa học
exports.getCourseProgress = async (studentId, courseId) => {
  const completedLessons = await lessonprogress.findAll({
    where: {
      studentid: studentId,
      iscompleted: true
    },
    include: [{
      model: lessons,
      as: 'lesson',
      where: { courseid: courseId },
      attributes: ['lessonid'] // Chỉ cần ID
    }],
    attributes: ['lessonid']
  });

  return completedLessons.map(p => p.lessonid);
};