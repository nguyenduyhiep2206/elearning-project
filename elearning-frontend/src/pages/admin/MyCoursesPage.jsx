// src/pages/MyCoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/course.service';
import { Link } from 'react-router-dom';

function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getMyCourses()
      .then(res => setCourses(res.data.data.courses))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Các khóa học của tôi</h1>
      <Link to="/admin/course/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Tạo khóa học mới
      </Link>
      <div className="grid grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.courseid} className="border rounded p-4">
            <h2 className="text-xl font-semibold">{course.coursename}</h2>
            <p>{course.description.substring(0, 100)}...</p>
            <div className="mt-4">
              <Link 
                to={`/admin/course/${course.courseid}/edit`} 
                className="text-blue-500 mr-4"
              >
                Chỉnh sửa
              </Link>
              <Link 
                to={`/admin/course/${course.courseid}/manage`} 
                className="text-green-500"
              >
                Quản lý Nội dung
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyCoursesPage;