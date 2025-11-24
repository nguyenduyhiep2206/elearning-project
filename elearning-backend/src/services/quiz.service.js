// services/quiz.service.js

// Import thêm lessons và courses để kiểm tra quyền
const { quizzes, quizquestions, quizoptions, lessons, courses } = require('../models');

// === HÀM HELPER: KIỂM TRA QUYỀN SỞ HỮU BÀI HỌC (LESSON) ===
// Dùng khi tạo Quiz mới (vì Quiz gắn vào Lesson)
const checkLessonOwnership = async (lessonId, teacherId) => {
    const lesson = await lessons.findByPk(lessonId, {
        include: [{ model: courses, as: 'course', attributes: ['teacherid'] }]
    });
    if (!lesson) throw new Error('Lesson not found');
    
    // Kiểm tra teacherId của khóa học có khớp không
    if (lesson.course.teacherid !== teacherId) {
        throw new Error('Permission denied');
    }
    return true;
};

// === HÀM HELPER: KIỂM TRA QUYỀN SỞ HỮU QUIZ ===
// Dùng khi sửa/xóa Quiz
const checkQuizOwnership = async (quizId, teacherId) => {
    const quiz = await quizzes.findByPk(quizId, {
        include: [{
            model: lessons,
            as: 'lesson',
            include: [{ model: courses, as: 'course', attributes: ['teacherid'] }]
        }]
    });
    if (!quiz) throw new Error('Quiz not found');

    if (quiz.lesson.course.teacherid !== teacherId) {
        throw new Error('Permission denied');
    }
    return quiz; // Trả về quiz để dùng luôn
};

// --- CÁC HÀM CHÍNH ---

exports.getQuizDetails = async (id) => {
  return await quizzes.findByPk(id, {
    include: [{
      model: quizquestions,
      as: 'questions',
      include: [{
        model: quizoptions,
        as: 'options'
      }]
    }]
  });
};

exports.createQuiz = async (quizData, teacherId) => {
  // quizData = { lessonid, title, ... }
  
  // 1. Kiểm tra bảo mật: Lesson này có phải của Teacher này không?
  await checkLessonOwnership(quizData.lessonid, teacherId);

  // 2. Tạo Quiz
  return await quizzes.create(quizData);
};

exports.updateQuiz = async (id, quizData, teacherId) => {
  // 1. Kiểm tra bảo mật + Tìm Quiz
  const quiz = await checkQuizOwnership(id, teacherId);
  
  // 2. Cập nhật
  return await quiz.update(quizData);
};

exports.deleteQuiz = async (id, teacherId) => {
  // 1. Kiểm tra bảo mật + Tìm Quiz
  const quiz = await checkQuizOwnership(id, teacherId);
  
  // 2. Xóa
  return await quiz.destroy();
};