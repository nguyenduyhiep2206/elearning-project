// services/course.service.js
// Import các model từ file index
const { courses, chapters, lessons, users, categories } = require('../models');

// Lấy tất cả khóa học (bao gồm giảng viên và danh mục)
exports.getAllCourses = async () => {
  return await courses.findAll({
    include: [
      { model: users, as: 'teacher', attributes: ['userid', 'fullname', 'email'] },
      { model: categories, as: 'category' }
    ]
  });
};

// Lấy 1 khóa học (bao gồm tất cả chương, bài học, giảng viên, danh mục)
exports.getCourseById = async (courseId) => {
  return await courses.findByPk(courseId, {
    include: [
      { model: users, as: 'teacher', attributes: ['userid', 'fullname'] },
      { model: categories, as: 'category' },
      {
        model: chapters,
        as: 'chapters',
        include: [{ 
          model: lessons, 
          as: 'lessons',
          attributes: ['lessonid', 'title', 'sortorder'] // Chỉ lấy thông tin cần thiết
        }]
      }
    ],
    order: [
      [chapters, 'sortorder', 'ASC'], // Sắp xếp chương
      [chapters, lessons, 'sortorder', 'ASC'] // Sắp xếp bài học
    ]
  });
};

// Tạo khóa học mới
exports.createCourse = async (courseData) => {
  // courseData sẽ là req.body
  return await courses.create(courseData);
};

// Cập nhật khóa học
exports.updateCourse = async (courseId, courseData) => {
  const course = await courses.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  return await course.update(courseData);
};

// Xóa khóa học
exports.deleteCourse = async (courseId) => {
  const course = await courses.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  return await course.destroy();
};