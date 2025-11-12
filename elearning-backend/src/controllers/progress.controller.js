// controllers/progress.controller.js
const progressService = require('../services/progress.service');

// API này được gọi khi user nhấn "Hoàn thành bài học"
exports.markLessonCompleted = async (req, res) => {
  try {
    // 1. Lấy studentId từ token (do middleware cung cấp)
    const studentId = req.user.userid; 
    const { lessonId } = req.body; // { "lessonId": 123 }

    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId is required' });
    }
    
    // 2. Gọi service
    const progress = await progressService.markLessonCompleted(studentId, lessonId);
    res.status(200).json({ message: 'Lesson marked as completed', progress });

  } catch (error) {
    console.error(error);
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }
    res.status(500).json({ message: error.message });
  }
};

// API này để lấy danh sách ID các bài học đã hoàn thành
exports.getCourseProgress = async (req, res) => {
  try {
    // 1. Lấy studentId từ token
    const studentId = req.user.userid; 
    const { courseId } = req.params; // Lấy từ URL /api/progress/course/:courseId

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }
    
    // 2. Gọi service
    const progress = await progressService.getCourseProgress(studentId, courseId);
    res.status(200).json(progress);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};