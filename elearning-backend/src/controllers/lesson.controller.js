// controllers/lesson.controller.js

const lessonService = require('../services/lesson.service');

// Hàm handleError của bạn (Giữ nguyên)
const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// =======================================================
// KHÔNG THAY ĐỔI (API CÔNG KHAI)
// =======================================================

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

// =======================================================
// ĐÃ SỬA (API RIÊNG TƯ CỦA INSTRUCTOR)
// =======================================================

exports.createLesson = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên)
    const teacherId = req.user.userid; 
    
    // 2. Truyền cả (data) và (teacherId) xuống service
    const newLesson = await lessonService.createLesson(req.body, teacherId); 
    
    res.status(201).json(newLesson);
  } catch (error) {
    // 3. Xử lý lỗi nếu service báo "Không có quyền" (403)
    if (error.message === 'Permission denied' || error.message === 'Chapter not found') {
      return res.status(403).json({ message: 'Bạn không có quyền tạo bài học cho chương này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};

exports.updateLesson = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên)
    const teacherId = req.user.userid; 
    const lessonId = req.params.id; // ID của bài học cần sửa

    // 2. Truyền cả (id, data, teacherId) xuống service
    const updatedLesson = await lessonService.updateLesson(lessonId, req.body, teacherId); 
    
    res.status(200).json(updatedLesson);
  } catch (error) {
    // 3. Xử lý lỗi 404 và 403
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }
    if (error.message === 'Permission denied') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài học này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên)
    const teacherId = req.user.userid; 
    const lessonId = req.params.id; // ID của bài học cần xóa

    // 2. Truyền cả (id, teacherId) xuống service
    await lessonService.deleteLesson(lessonId, teacherId); 
    
    res.status(204).send(); // 204 No Content (Xóa thành công)
  } catch (error) {
    // 3. Xử lý lỗi 404 và 403
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ message: 'Không tìm thấy bài học' });
    }
    if (error.message === 'Permission denied') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài học này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};