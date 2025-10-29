// src/pages/LessonPlayerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { lessonService } from '../services/lesson.service';
import { progressService } from '../services/progress.service';
import LessonSidebar from '../components/course/LessonSidebar';
import LessonComments from '../components/course/LessonComments';

function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tải nội dung bài học (video, text)
    setLoading(true);
    lessonService.getLessonById(lessonId)
      .then(res => setLesson(res.data))
      .catch(err => console.error("Lỗi tải bài học:", err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleMarkComplete = async () => {
    try {
      await progressService.markLessonCompleted(parseInt(lessonId));
      alert("Đã hoàn thành!");
      // (Bạn nên refresh lại sidebar hoặc navigate đến bài tiếp theo)
      window.location.reload(); // Cách đơn giản nhất
    } catch (err) {
      alert("Đánh dấu thất bại");
    }
  };

  return (
    <div className="flex h-screen">
      {/* 1. Sidebar (Danh sách bài học) */}
      <div className="w-1/3 h-full overflow-y-auto bg-gray-50 border-r">
        <LessonSidebar courseId={courseId} />
      </div>

      {/* 2. Nội dung chính */}
      <div className="w-2/3 h-full overflow-y-auto p-6">
        {loading && <div>Đang tải bài học...</div>}
        {lesson && (
          <div>
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            
            {/* Giả lập Video Player */}
            <div className="aspect-video bg-black text-white flex items-center justify-center mb-4">
              <span>{lesson.videourl || 'Video Player'}</span>
            </div>
            
            <button
              onClick={handleMarkComplete}
              className="bg-green-500 text-white px-6 py-2 rounded font-bold"
            >
              Đánh dấu Hoàn thành
            </button>
            
            <hr className="my-8" />
            
            {/* Khu vực Tabs (Comment, Forum, Assignment) */}
            {/* (Bạn nên dùng thư viện Tabs) */}
            <div>
              {/* Tab 1: Bình luận */}
              <LessonComments lessonId={lessonId} />
              
              {/* Tab 2: Forum (Tương tự) */}
              
              {/* Tab 3: Assignment (Tương tự) */}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonPlayerPage;