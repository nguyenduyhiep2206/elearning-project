// controllers/chapter.controller.js

const chapterService = require('../services/chapter.service');

// Hàm handleError của bạn (Giữ nguyên)
const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

// =======================================================
// KHÔNG THAY ĐỔI (API CÔNG KHAI)
// =======================================================

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

// =======================================================
// ĐÃ SỬA (API RIÊNG TƯ CỦA INSTRUCTOR)
// =======================================================

exports.createChapter = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên) từ middleware
    const teacherId = req.user.userid; 
    
    // 2. Truyền cả (data) và (teacherId) xuống service
    const newChapter = await chapterService.createChapter(req.body, teacherId); 
    
    res.status(201).json(newChapter);
  } catch (error) {
    // 3. Xử lý lỗi nếu service báo "Không có quyền" (403)
    if (error.message === 'Permission denied' || error.message === 'Course not found') {
      return res.status(403).json({ message: 'Bạn không có quyền tạo chương cho khóa học này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};

exports.updateChapter = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên)
    const teacherId = req.user.userid; 
    const chapterId = req.params.id; // ID của chương cần sửa

    // 2. Truyền cả (id, data, teacherId) xuống service
    const updatedChapter = await chapterService.updateChapter(chapterId, req.body, teacherId); 
    
    res.status(200).json(updatedChapter);
  } catch (error) {
    // 3. Xử lý lỗi 404 và 403
    if (error.message === 'Chapter not found') {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }
    if (error.message === 'Permission denied') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật chương này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    // 1. Lấy ID của instructor (Giáo viên)
    const teacherId = req.user.userid; 
    const chapterId = req.params.id; // ID của chương cần xóa

    // 2. Truyền cả (id, teacherId) xuống service
    await chapterService.deleteChapter(chapterId, teacherId); 
    
    res.status(204).send(); // 204 No Content (Xóa thành công)
  } catch (error) {
    // 3. Xử lý lỗi 404 và 403
    if (error.message === 'Chapter not found') {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
    }
    if (error.message === 'Permission denied') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa chương này' });
    }
    handleError(res, error); // Lỗi 500 chung
  }
};