// src/services/answer.service.js

const { 
  quizsessions, 
  quizanswers, 
  quizquestions, 
  quizzes, 
  sequelize 
} = require('../models');

// 1. Bắt đầu làm bài (Tạo Session)
exports.startQuiz = async (studentId, quizId) => {
  // Kiểm tra quiz có tồn tại không
  const quiz = await quizzes.findByPk(quizId);
  if (!quiz) throw new Error('Quiz not found');

  // Tạo phiên làm bài mới
  const newSession = await quizsessions.create({
    quizid: quizId,
    studentid: studentId,
    starttime: new Date(), // Thời gian bắt đầu làm
    startedat: new Date()
  });

  return newSession;
};

// 2. Nộp bài và Chấm điểm
exports.submitQuiz = async (sessionId, studentId, userAnswers) => {
  // userAnswers là mảng: [{ questionId: 1, selectedOptionId: 5 }, ...]

  // A. Tìm session
  const session = await quizsessions.findOne({ 
    where: { sessionid: sessionId, studentid: studentId } 
  });
  
  if (!session) throw new Error('Session not found or unauthorized');
  if (session.submittedat) throw new Error('Quiz already submitted');

  // B. Lấy tất cả câu hỏi của Quiz này để so sánh đáp án
  const questions = await quizquestions.findAll({
    where: { quizid: session.quizid },
    attributes: ['questionid', 'correctoptionid'] // Chỉ cần lấy ID đáp án đúng
  });

  // Chuyển questions thành Map để tra cứu cho nhanh: { questionId: correctOptionId }
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q.questionid] = q.correctoptionid;
  });

  let correctCount = 0;
  const totalQuestions = questions.length;
  const answersToSave = [];

  // C. Duyệt qua câu trả lời của học viên
  for (const ans of userAnswers) {
    const correctOptionId = questionMap[ans.questionId];
    
    // Kiểm tra đúng sai
    const isCorrect = (correctOptionId && correctOptionId === ans.selectedOptionId);
    
    if (isCorrect) correctCount++;

    // Chuẩn bị dữ liệu để lưu vào bảng quizanswers
    answersToSave.push({
      sessionid: sessionId,
      questionid: ans.questionId,
      selectedoptionid: ans.selectedOptionId,
      iscorrect: isCorrect,
      answeredat: new Date()
    });
  }

  // D. Tính điểm (Thang điểm 10)
  const finalScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;

  // E. Sử dụng Transaction để lưu mọi thứ cùng lúc (An toàn dữ liệu)
  return await sequelize.transaction(async (t) => {
    // 1. Lưu chi tiết từng câu trả lời
    await quizanswers.bulkCreate(answersToSave, { transaction: t });

    // 2. Cập nhật Session (Kết thúc bài thi)
    const updatedSession = await session.update({
      submittedat: new Date(),
      endtime: new Date(),
      score: parseFloat(finalScore.toFixed(2)) // Làm tròn 2 chữ số thập phân
    }, { transaction: t });

    return {
      sessionId: updatedSession.sessionid,
      score: updatedSession.score,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      message: 'Nộp bài thành công!'
    };
  });
};