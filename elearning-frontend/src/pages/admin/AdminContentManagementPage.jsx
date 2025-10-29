// src/pages/admin/AdminContentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { lessonService } from '../../services/lesson.service';
import { assignmentService } from '../../services/assignment.service';

// (Đây là một trang phức tạp, bạn nên chia nhỏ thành các components con)

function AdminContentManagementPage() {
  const { id: courseId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy Chapters và Lessons
      const chapRes = await lessonService.getChaptersByCourse(courseId);
      const chaptersWithLessons = await Promise.all(
        chapRes.data.map(async (chapter) => {
          const lessRes = await lessonService.getLessonsByChapter(chapter.chapterid);
          return { ...chapter, lessons: lessRes.data };
        })
      );
      setChapters(chaptersWithLessons);

      // 2. Lấy Assignments
      const assignRes = await assignmentService.getAssignmentsByCourse(courseId);
      setAssignments(assignRes.data);

    } catch (err) {
      console.error("Lỗi tải nội dung:", err);
    } finally {
      setLoading(false);
    }
  };

  // Các hàm (Handle) để Thêm/Sửa/Xóa Chapter/Lesson/Assignment...
  const handleCreateChapter = async () => {
    const title = prompt("Nhập tên chương:");
    if (!title) return;
    try {
      await lessonService.createChapter({ courseid: courseId, title });
      fetchData(); // Tải lại dữ liệu
    } catch (err) {
      alert("Tạo chương thất bại");
    }
  };
  
  const handleCreateLesson = async (chapterId) => {
    const title = prompt("Nhập tên bài học:");
    if (!title) return;
    try {
      // (Bạn sẽ cần form đầy đủ hơn cho videourl, duration...)
      await lessonService.createLesson({ chapterid: chapterId, title, videourl: 'pending' });
      fetchData(); // Tải lại
    } catch (err) {
      alert("Tạo bài học thất bại");
    }
  };
  
  // (Thêm các hàm cho CreateAssignment, CreateQuiz...)

  if (loading) return <div>Đang tải trình quản lý...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý Nội dung Khóa học</h1>
      
      {/* Phần 1: Quản lý Chapters & Lessons */}
      <h2 className="text-2xl font-semibold mb-3">Chương và Bài học</h2>
      <button onClick={handleCreateChapter} className="bg-blue-500 text-white px-3 py-1 rounded mb-4">
        + Thêm Chương
      </button>
      <div className="space-y-4">
        {chapters.map(chapter => (
          <div key={chapter.chapterid} className="border p-4 rounded-lg">
            <h3 className="text-xl font-bold">{chapter.title}</h3>
            <ul className="ml-4 mt-2 space-y-2">
              {chapter.lessons.map(lesson => (
                <li key={lesson.lessonid} className="flex justify-between">
                  <span>{lesson.title}</span>
                  {/* (Thêm nút sửa/xóa lesson) */}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleCreateLesson(chapter.chapterid)} 
              className="bg-green-500 text-white px-2 py-1 text-sm rounded mt-3">
              + Thêm Bài học
            </button>
          </div>
        ))}
      </div>

      {/* Phần 2: Quản lý Assignments */}
      <h2 className="text-2xl font-semibold mt-8 mb-3">Bài tập lớn (Assignments)</h2>
      {/* (Thêm nút tạo Assignment) */}
      <ul className="space-y-2">
        {assignments.map(assign => (
          <li key={assign.assignmentid} className="border p-2 rounded">
            {assign.title}
          </li>
        ))}
      </ul>
      
      {/* Phần 3: Quản lý Quizzes (Tương tự) */}
      
    </div>
  );
}

export default AdminContentManagementPage;