// src/controllers/submission.controller.js
const assignmentService = require('../services/assignment.service');

// Học viên nộp bài
exports.submitAssignment = async (req, res) => {
    try {
        const studentId = req.user.userid;
        const { assignmentId, fileUrl } = req.body;
        
        const result = await assignmentService.submitAssignment({
            assignmentid: assignmentId,
            studentid: studentId,
            fileurl: fileUrl
        });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Giáo viên chấm điểm
exports.gradeSubmission = async (req, res) => {
    try {
        const teacherId = req.user.userid;
        const { grade, feedback } = req.body;
        const submissionId = req.params.id;

        const result = await assignmentService.gradeSubmission(submissionId, grade, feedback, teacherId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Permission denied') return res.status(403).json({ message: error.message });
        res.status(500).json({ message: error.message });
    }
};

// Giáo viên lấy danh sách bài nộp
exports.getSubmissionsByAssignment = async (req, res) => {
    try {
        const teacherId = req.user.userid;
        const list = await assignmentService.getSubmissionsByAssignment(req.params.assignmentId, teacherId);
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};