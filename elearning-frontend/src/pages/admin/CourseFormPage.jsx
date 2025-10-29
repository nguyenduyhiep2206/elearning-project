// src/pages/admin/CourseFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { categoryService } from '../../services/category.service';
import { useAuth } from '../../context/AuthContext';

function CourseFormPage() {
  const { id } = useParams(); // Lấy 'id' từ URL
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin giảng viên

  const [course, setCourse] = useState({
    coursename: '',
    description: '',
    price: 0,
    categoryid: '',
    imageurl: '',
    level: 'Beginner', // Giá trị mặc định
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(id); // Kiểm tra xem đây là trang Sửa hay Tạo mới

  useEffect(() => {
    // 1. Tải danh sách categories để chọn
    categoryService.getAllCategories()
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Lỗi tải categories:", err));

    // 2. Nếu là chế độ Sửa, tải dữ liệu khóa học
    if (isEditMode) {
      setLoading(true);
      courseService.getCourseById(id)
        .then(res => {
          setCourse(res.data.data); // Điền form với dữ liệu cũ
        })
        .catch(err => setError('Không tìm thấy khóa học'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Dữ liệu sẽ gửi đi (Backend cần 'teacherid' từ user)
    const courseData = {
      ...course,
      teacherid: user.userid, // Đảm bảo backend nhận được ID giảng viên
    };

    try {
      if (isEditMode) {
        // Chế độ Sửa
        await courseService.updateCourse(id, courseData);
        alert('Cập nhật khóa học thành công!');
      } else {
        // Chế độ Tạo mới
        await courseService.createCourse(courseData);
        alert('Tạo khóa học thành công!');
      }
      navigate('/admin/my-courses'); // Điều hướng về trang quản lý
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? 'Chỉnh sửa Khóa học' : 'Tạo Khóa học mới'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Tên khóa học</label>
          <input
            type="text"
            name="coursename"
            value={course.coursename}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block font-medium">Mô tả</label>
          <textarea
            name="description"
            value={course.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="5"
          ></textarea>
        </div>
        
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block font-medium">Giá (VNĐ)</label>
            <input
              type="number"
              name="price"
              value={course.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block font-medium">Danh mục</label>
            <select
              name="categoryid"
              value={course.categoryid}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.categoryid} value={cat.categoryid}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block font-medium">Link ảnh bìa (URL)</label>
          <input
            type="text"
            name="imageurl"
            value={course.imageurl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo Khóa học')}
        </button>
      </form>
    </div>
  );
}

export default CourseFormPage;