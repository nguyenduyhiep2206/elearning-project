// src/controllers/assignment.controller.js
const assignmentService = require('../services/assignment.service');

exports.createAssignment = async (req, res) => {
    try {
        const teacherId = req.user.userid;
        const newAssign = await assignmentService.createAssignment(req.body, teacherId);
        res.status(201).json(newAssign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const list = await assignmentService.getAssignmentsByCourse(req.params.courseId);
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};