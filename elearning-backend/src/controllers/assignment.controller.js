// controllers/assignment.controller.js

const assignmentService = require('../services/assignment.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const allAssignments = await assignmentService.getAssignmentsByCourse(req.params.courseId);
    res.status(200).json(allAssignments);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json(assignment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const newAssignment = await assignmentService.createAssignment(req.body);
    res.status(201).json(newAssignment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const updatedAssignment = await assignmentService.updateAssignment(req.params.id, req.body);
    res.status(200).json(updatedAssignment);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};