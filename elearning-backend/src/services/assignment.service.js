// services/assignment.service.js

const { assignments, submissions, users } = require('../models');

// Lấy tất cả bài tập CỦA 1 KHÓA HỌC
exports.getAssignmentsByCourse = async (courseId) => {
  return await assignments.findAll({
    where: { courseid: courseId },
    order: [['createdat', 'ASC']]
  });
};

// Lấy chi tiết 1 bài tập (kèm các bài nộp của SV)
exports.getAssignmentById = async (id) => {
  return await assignments.findByPk(id, {
    include: [{
      model: submissions,
      as: 'submissions',
      include: [{ model: users, as: 'student', attributes: ['userid', 'fullname'] }]
    }]
  });
};

exports.createAssignment = async (assignmentData) => {
  // assignmentData phải bao gồm { courseid: 1, title: "...", description: "...", duedate: "..." }
  return await assignments.create(assignmentData);
};

exports.updateAssignment = async (id, assignmentData) => {
  const assignment = await assignments.findByPk(id);
  if (!assignment) throw new Error('Assignment not found');
  return await assignment.update(assignmentData);
};

exports.deleteAssignment = async (id) => {
  const assignment = await assignments.findByPk(id);
  if (!assignment) throw new Error('Assignment not found');
  return await assignment.destroy();
};