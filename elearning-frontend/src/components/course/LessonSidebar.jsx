// src/components/course/LessonSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonService } from '../../services/lesson.service';
import { progressService } from '../../services/progress.service';

function LessonSidebar({ courseId }) {
  const { lessonId: currentLessonId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy tiến độ
        const progRes = await progressService.getCourseProgress(courseId);
        setCompletedLessons(new Set(progRes.data.completedLessons));
        
        // 2. Lấy curriculum
        const chapRes = await lessonService.getChaptersByCourse(courseId);
        const chaptersWithLessons = await Promise.all(
          chapRes.data.map(async (chapter) => {
            const lessRes = await lessonService.getLessonsByChapter(chapter.chapterid);
            return { ...chapter, lessons: lessRes.data };
          })
        );
        setChapters(chaptersWithLessons);
      } catch (err) {
        console.error("Lỗi tải sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="w-full">
      {chapters.map(chapter => (
        <div key={chapter.chapterid} className="mb-2">
          <h3 className="font-bold p-3 bg-gray-200">{chapter.title}</h3>
          <ul className="list-none m-0 p-0">
            {chapter.lessons.map(lesson => {
              const isCompleted = completedLessons.has(lesson.lessonid);
              const isCurrent = parseInt(currentLessonId) === lesson.lessonid;
              
              return (
                <li key={lesson.lessonid}>
                  <Link
                    to={`/learn/${courseId}/lesson/${lesson.lessonid}`}
                    className={`block p-3 border-b ${isCurrent ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {isCompleted ? '✅' : '⬜️'} {lesson.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default LessonSidebar;