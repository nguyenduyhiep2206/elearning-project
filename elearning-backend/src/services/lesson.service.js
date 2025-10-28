// services/lesson.service.js

const { lessons, quizzes } = require('../models');

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

exports.createLesson = async (lessonData) => {
  // lessonData phải bao gồm { title: "...", courseid: 1, chapterid: 1, content: "..." }
  return await lessons.create(lessonData);
};

exports.updateLesson = async (id, lessonData) => {
  const lesson = await lessons.findByPk(id);
  if (!lesson) throw new Error('Lesson not found');
  return await lesson.update(lessonData);
};

exports.deleteLesson = async (id) => {
  const lesson = await lessons.findByPk(id);
  if (!lesson) throw new Error('Lesson not found');
  return await lesson.destroy();
};