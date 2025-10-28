// api/routes/lesson.routes.js

const express = require('express');
const router = express.Router();
const lessonController = require('../../controllers/lesson.controller');

router.post('/', lessonController.createLesson);
router.get('/chapter/:chapterId', lessonController.getLessonsByChapter); // API Lấy các bài học theo chương
router.get('/:id', lessonController.getLessonById); // API Lấy chi tiết 1 bài học
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;