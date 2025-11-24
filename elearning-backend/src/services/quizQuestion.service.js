// services/quizQuestion.service.js

const { quizquestions, quizoptions, quizzes, lessons, courses, sequelize } = require('../models');

// === HELPER: KIỂM TRA QUYỀN (QUIZ -> LESSON -> COURSE -> TEACHER) ===
const checkQuizOwnership = async (quizId, teacherId) => {
    const quiz = await quizzes.findByPk(quizId, {
        include: [{
            model: lessons,
            as: 'lesson',
            include: [{ model: courses, as: 'course', attributes: ['teacherid'] }]
        }]
    });
    if (!quiz) throw new Error('Quiz not found');
    if (quiz.lesson.course.teacherid !== teacherId) throw new Error('Permission denied');
    return true;
};

const checkQuestionOwnership = async (questionId, teacherId) => {
    const question = await quizquestions.findByPk(questionId, {
        include: [{
            model: quizzes,
            as: 'quiz',
            include: [{
                model: lessons,
                as: 'lesson',
                include: [{ model: courses, as: 'course', attributes: ['teacherid'] }]
            }]
        }]
    });
    if (!question) throw new Error('Question not found');
    if (question.quiz.lesson.course.teacherid !== teacherId) throw new Error('Permission denied');
    return question;
};
// =====================================================================

exports.createQuestionWithOptions = async (questionData, teacherId) => {
  const { quizid, questiontext, correctoptiontext, options } = questionData;
  
  // 1. BẢO MẬT: Kiểm tra Quiz có thuộc về Teacher không
  await checkQuizOwnership(quizid, teacherId);

  let correctOptionId = null;

  return sequelize.transaction(async (t) => {
    // 2. Tạo câu hỏi
    const newQuestion = await quizquestions.create({
      quizid,
      questiontext
    }, { transaction: t });
    
    // 3. Tạo các lựa chọn
    for (const optionText of options) {
      const newOption = await quizoptions.create({
        questionid: newQuestion.questionid,
        optiontext: optionText
      }, { transaction: t });

      if (optionText === correctoptiontext) {
        correctOptionId = newOption.optionid;
      }
    }

    // 4. Cập nhật đáp án đúng
    if (correctOptionId) {
      await newQuestion.update({ correctoptionid: correctOptionId }, { transaction: t });
    } else {
      // Nếu không tìm thấy đáp án đúng trong danh sách -> Rollback (tự động khi throw)
      throw new Error('Correct option text not found in options list');
    }

    return newQuestion;
  });
};

exports.updateQuestion = async (id, questionData, teacherId) => {
  // 1. BẢO MẬT: Kiểm tra quyền
  const question = await checkQuestionOwnership(id, teacherId);
  
  // 2. Cập nhật
  return await question.update(questionData);
};

exports.deleteQuestion = async (id, teacherId) => {
  // 1. BẢO MẬT: Kiểm tra quyền
  const question = await checkQuestionOwnership(id, teacherId);
  
  // 2. Xóa (Cần xóa cascade options nếu database chưa set)
  // Ở đây giả sử DB đã set ON DELETE CASCADE cho options
  return await question.destroy();
};