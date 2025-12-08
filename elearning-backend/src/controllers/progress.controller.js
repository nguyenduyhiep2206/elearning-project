// controllers/progress.controller.js
const progressService = require('../services/progress.service');

// API này được gọi khi user nhấn "Hoàn thành bài học"
exports.markLessonCompleted = async (req, res) => {
  try {
    // Giả sử studentId được lấy từ token (req.user.id)
    const studentId = req.user.id; // Bạn CẦN middleware xác thực để có cái này
    const { lessonId } = req.body; // { "lessonId": 123 }

    // Nếu chưa có auth, test tạm:
    // const { studentId, lessonId } = req.body; // { "studentId": 1, "lessonId": 123 }

    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId is required' });
    }
    
    // Tạm thời hardcode studentId để test
    // const studentId = 1; // XÓA KHI CÓ AUTH

    const progress = await progressService.markLessonCompleted(studentId, lessonId);
    res.status(200).json({ message: 'Lesson marked as completed', progress });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// API này để lấy danh sách ID các bài học đã hoàn thành
exports.getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user.id; // Cần auth
    const { courseId } = req.params; // Lấy từ URL /api/progress/course/:courseId

    // Tạm thời hardcode studentId để test
    // const studentId = 1; // XÓA KHI CÓ AUTH

    const completedLessonIds = await progressService.getCourseProgress(studentId, courseId);
    res.status(200).json(completedLessonIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};