// api/routes/chapter.routes.js

const express = require('express');
const router = express.Router();
const chapterController = require('../../controllers/chapter.controller');

router.post('/', chapterController.createChapter);
router.get('/course/:courseId', chapterController.getChaptersByCourse); // API Lấy các chương theo khóa học
router.get('/:id', chapterController.getChapterById);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;