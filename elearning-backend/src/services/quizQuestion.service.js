// services/quizQuestion.service.js

const { quizquestions, quizoptions, sequelize } = require('../models');

// Tạo 1 câu hỏi (kèm các lựa chọn của nó)
exports.createQuestionWithOptions = async (questionData) => {
  // questionData = {
  //   quizid: 1,
  //   questiontext: "Câu hỏi là gì?",
  //   correctoptiontext: "Đáp án A", // Text của đáp án đúng
  //   options: [ // Mảng các text của lựa chọn
  //     "Đáp án A",
  //     "Đáp án B",
  //     "Đáp án C"
  //   ]
  // }
  
  const { quizid, questiontext, correctoptiontext, options } = questionData;
  let correctOptionId = null;

  return sequelize.transaction(async (t) => {
    // 1. Tạo câu hỏi
    const newQuestion = await quizquestions.create({
      quizid,
      questiontext
    }, { transaction: t });
    
    // 2. Tạo các lựa chọn
    for (const optionText of options) {
      const newOption = await quizoptions.create({
        questionid: newQuestion.questionid,
        optiontext: optionText
      }, { transaction: t });

      // 3. Nếu lựa chọn này là đáp án đúng, lưu ID của nó
      if (optionText === correctoptiontext) {
        correctOptionId = newOption.optionid;
      }
    }

    // 4. Cập nhật lại câu hỏi với ID của đáp án đúng
    if (correctOptionId) {
      await newQuestion.update({ correctoptionid: correctOptionId }, { transaction: t });
    } else {
      throw new Error('Correct option text not found in options list');
    }

    return newQuestion;
  });
};

exports.updateQuestion = async (id, questionData) => {
  const question = await quizquestions.findByPk(id);
  if (!question) throw new Error('Question not found');
  return await question.update(questionData);
  // Lưu ý: update options phức tạp hơn, cần service riêng
};

exports.deleteQuestion = async (id) => {
  const question = await quizquestions.findByPk(id);
  if (!question) throw new Error('Question not found');
  // Cần xóa các options con trước
  await quizoptions.destroy({ where: { questionid: id } });
  return await question.destroy();
};