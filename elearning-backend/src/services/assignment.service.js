// src/services/assignment.service.js
const { assignments, submissions, courses, users } = require('../models');

// === HELPER: Kiểm tra quyền giáo viên ===
const checkCourseOwnership = async (courseId, teacherId) => {
    const course = await courses.findByPk(courseId);
    if (!course) throw new Error('Course not found');
    if (course.teacherid !== teacherId) throw new Error('Permission denied');
    return true;
};

// 1. Tạo Assignment (Giáo viên)
exports.createAssignment = async (data, teacherId) => {
    await checkCourseOwnership(data.courseid, teacherId);
    return await assignments.create(data);
};

// 2. Lấy danh sách Assignment theo Course
exports.getAssignmentsByCourse = async (courseId) => {
    return await assignments.findAll({
        where: { courseid: courseId },
        order: [['duedate', 'ASC']]
    });
};

// 3. Học viên nộp bài (Submission)
exports.submitAssignment = async (data) => {
    // data = { assignmentid, studentid, fileurl }
    const assignment = await assignments.findByPk(data.assignmentid);
    if (!assignment) throw new Error('Assignment not found');

    // Kiểm tra xem đã nộp chưa (nếu muốn mỗi người chỉ nộp 1 lần)
    const existing = await submissions.findOne({
        where: { assignmentid: data.assignmentid, studentid: data.studentid }
    });

    if (existing) {
        // Nếu nộp rồi thì update file mới
        return await existing.update({ fileurl: data.fileurl, submittedat: new Date() });
    }
    return await submissions.create(data);
};

// 4. Giáo viên chấm điểm
exports.gradeSubmission = async (submissionId, grade, feedback, teacherId) => {
    // Tìm bài nộp kèm thông tin Assignment -> Course
    const submission = await submissions.findByPk(submissionId, {
        include: [{
            model: assignments,
            as: 'assignment',
            include: [{ model: courses, as: 'course' }] // Cần alias chính xác trong model
        }]
    });

    if (!submission) throw new Error('Submission not found');

    // Kiểm tra: Người chấm điểm có phải giáo viên của khóa học đó không?
    if (submission.assignment.course.teacherid !== teacherId) {
        throw new Error('Permission denied');
    }

    return await submission.update({ grade, feedback });
};

// 5. Lấy danh sách bài nộp của 1 Assignment (Cho giáo viên xem)
exports.getSubmissionsByAssignment = async (assignmentId, teacherId) => {
    const assignment = await assignments.findByPk(assignmentId, {
        include: [{ model: courses, as: 'course' }]
    });
    if (!assignment) throw new Error('Assignment not found');
    
    // Bảo mật
    if (assignment.course.teacherid !== teacherId) throw new Error('Permission denied');

    return await submissions.findAll({
        where: { assignmentid: assignmentId },
        include: [{ model: users, as: 'student', attributes: ['userid', 'fullname'] }]
    });
};