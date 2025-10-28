// controllers/chapter.controller.js

const chapterService = require('../services/chapter.service');

const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getChaptersByCourse = async (req, res) => {
  try {
    const allChapters = await chapterService.getChaptersByCourse(req.params.courseId);
    res.status(200).json(allChapters);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const chapter = await chapterService.getChapterById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json(chapter);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createChapter = async (req, res) => {
  try {
    const newChapter = await chapterService.createChapter(req.body);
    res.status(201).json(newChapter);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const updatedChapter = await chapterService.updateChapter(req.params.id, req.body);
    res.status(200).json(updatedChapter);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    await chapterService.deleteChapter(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};