// controllers/course.controller.js
const courseService = require('../services/course.service');

// Hàm xử lý lỗi chung (hoặc bạn có thể dùng middleware)
const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: error.message });
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await courseService.getAllCourses();
    res.status(200).json(allCourses);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createCourse = async (req, res) => {
  try {
    // Giả sử teacherid được lấy từ req.user (đã đăng nhập)
    // const teacherId = req.user.id;
    // const newCourse = await courseService.createCourse({...req.body, teacherid: teacherId});
    
    // Hoặc lấy từ req.body nếu admin tạo
    const newCourse = await courseService.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json(updatedCourse);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    handleError(res, error);
  }
};