// controllers/submission.controller.js

const submissionService = require('../services/submission.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// Học viên xem bài nộp của mình
exports.getSubmission = async (req, res) => {
  try {
    // const studentId = req.user.id;
    const { assignmentId } = req.params;
    
    // Tạm thời
    const { studentId } = req.query; // /submission/assignment/123?studentId=1
    
    const submission = await submissionService.getSubmission(studentId, assignmentId);
    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }
    res.status(200).json(submission);
  } catch (error) {
    handleError(res, error);
  }
};

// Học viên nộp bài
exports.submitAssignment = async (req, res) => {
  try {
    // const studentId = req.user.id;
    // const { assignmentId, fileurl } = req.body;
    // const submission = await submissionService.submitAssignment({ studentid: studentId, assignmentid, fileurl });
    
    // Tạm thời
    const submission = await submissionService.submitAssignment(req.body); // { studentid, assignmentid, fileurl }
    
    res.status(201).json(submission);
  } catch (error) {
    handleError(res, error);
  }
};

// Giảng viên chấm điểm
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const gradedSubmission = await submissionService.gradeSubmission(submissionId, grade, feedback);
    res.status(200).json(gradedSubmission);
  } catch (error) {
    handleError(res, error);
  }
};