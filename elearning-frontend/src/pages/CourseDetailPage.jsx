// src/pages/CourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../services/course.service';
import { lessonService } from '../services/lesson.service';

function CourseDetailPage() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [firstLessonId, setFirstLessonId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Lấy thông tin khóa học
        const courseRes = await courseService.getCourseById(courseId);
        setCourse(courseRes.data.data);

        // 2. Lấy curriculum (chương + bài học)
        const chapRes = await lessonService.getChaptersByCourse(courseId);
        const chaptersWithLessons = await Promise.all(
          chapRes.data.map(async (chapter) => {
            const lessRes = await lessonService.getLessonsByChapter(chapter.chapterid);
            return { ...chapter, lessons: lessRes.data };
          })
        );
        setChapters(chaptersWithLessons);
        
        // 3. Tìm bài học đầu tiên để bắt đầu
        if (chaptersWithLessons.length > 0 && chaptersWithLessons[0].lessons.length > 0) {
          setFirstLessonId(chaptersWithLessons[0].lessons[0].lessonid);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div>Đang tải...</div>;
  if (!course) return <div>Không tìm thấy khóa học.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{course.coursename}</h1>
      <p className="text-lg mt-2">{course.description}</p>
      
      {/* Nút bắt đầu học */}
      {firstLessonId ? (
        <Link 
          to={`/learn/${courseId}/lesson/${firstLessonId}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-bold my-6 inline-block"
        >
          Bắt đầu học
        </Link>
      ) : (
        <p className="my-6 p-4 bg-gray-100 rounded">Khóa học đang được xây dựng.</p>
      )}

      {/* Danh sách nội dung (Curriculum) */}
      <h2 className="text-2xl font-semibold mb-4">Nội dung khóa học</h2>
      <div className="space-y-4">
        {chapters.map(chapter => (
          <div key={chapter.chapterid} className="border p-4 rounded">
            <h3 className="text-xl font-bold">{chapter.title}</h3>
            <ul className="list-disc ml-8 mt-2">
              {chapter.lessons.map(lesson => (
                <li key={lesson.lessonid}>{lesson.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseDetailPage;