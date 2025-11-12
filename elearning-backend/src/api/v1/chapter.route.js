// api/routes/chapter.routes.js

const express = require('express');
const router = express.Router();
const chapterController = require('../../controllers/chapter.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');


router.get('/course/:courseId', chapterController.getChaptersByCourse);
router.get('/:id', chapterController.getChapterById);

// Thêm 2 dòng này để bảo vệ các route bên dưới
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware.isInstructor);

router.post('/', chapterController.createChapter);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;