// services/chapter.service.js

const { chapters, lessons } = require('../models');

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

exports.createChapter = async (chapterData) => {
  // chapterData phải bao gồm { title: "...", courseid: 1, sortorder: 0 }
  return await chapters.create(chapterData);
};

exports.updateChapter = async (id, chapterData) => {
  const chapter = await chapters.findByPk(id);
  if (!chapter) throw new Error('Chapter not found');
  return await chapter.update(chapterData);
};

exports.deleteChapter = async (id) => {
  const chapter = await chapters.findByPk(id);
  if (!chapter) throw new Error('Chapter not found');
  // Cần xử lý xóa/di chuyển các bài học con trước khi xóa chương (hoặc set ON DELETE CASCADE)
  return await chapter.destroy();
};