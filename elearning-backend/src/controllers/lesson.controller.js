// controllers/lesson.controller.js

const lessonService = require('../services/lesson.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getLessonsByChapter = async (req, res) => {
  try {
    const allLessons = await lessonService.getLessonsByChapter(req.params.chapterId);
    res.status(200).json(allLessons);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.status(200).json(lesson);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createLesson = async (req, res) => {
  try {
    const newLesson = await lessonService.createLesson(req.body);
    res.status(201).json(newLesson);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const updatedLesson = await lessonService.updateLesson(req.params.id, req.body);
    res.status(200).json(updatedLesson);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    await lessonService.deleteLesson(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};