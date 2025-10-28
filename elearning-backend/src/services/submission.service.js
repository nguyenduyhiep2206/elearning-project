// services/submission.service.js

const { submissions } = require('../models');

// Lấy bài nộp CỦA 1 HỌC VIÊN cho 1 BÀI TẬP
exports.getSubmission = async (studentId, assignmentId) => {
  return await submissions.findOne({
    where: {
      studentid: studentId,
      assignmentid: assignmentId
    }
  });
};

// Học viên nộp bài (hoặc nộp lại)
exports.submitAssignment = async (submissionData) => {
  // submissionData = { studentid, assignmentid, fileurl }
  const { studentid, assignmentid, fileurl } = submissionData;

  const [submission, created] = await submissions.findOrCreate({
    where: {
      studentid,
      assignmentid
    },
    defaults: {
      fileurl,
      submittedat: new Date()
    }
  });

  // Nếu không phải tạo mới (tức là nộp lại) -> thì update
  if (!created) {
    await submission.update({
      fileurl,
      submittedat: new Date(),
      grade: null, // Reset điểm khi nộp lại
      feedback: null
    });
  }
  return submission;
};

// Giảng viên chấm điểm
exports.gradeSubmission = async (submissionId, grade, feedback) => {
  const submission = await submissions.findByPk(submissionId);
  if (!submission) throw new Error('Submission not found');
  
  return await submission.update({
    grade,
    feedback
  });
};