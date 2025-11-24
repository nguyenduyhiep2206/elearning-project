import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lessonService } from '../services/lesson.service';
import { progressService } from '../services/progress.service';
import QuizPlayer from '../components/QuizPlayer'; // <--- 1. IMPORT QUIZ PLAYER

const LessonPlayerPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  // State dữ liệu
  const [chapters, setChapters] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]); // Danh sách bài đã học
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [isVideoEnded, setIsVideoEnded] = useState(false); 

  // 1. Tải danh sách bài học (Sidebar) và Tiến độ
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Lấy cấu trúc chương/bài học
        const chapRes = await lessonService.getChaptersByCourse(courseId);
        setChapters(chapRes.data);

        // Lấy tiến độ học tập (các bài đã xong)
        const progressRes = await progressService.getCourseProgress(courseId);
        setCompletedLessonIds(progressRes.data); 

      } catch (error) {
        console.error("Lỗi tải sidebar:", error);
      }
    };
    fetchSidebarData();
  }, [courseId]);

  // 2. Tải nội dung bài học hiện tại (Khi lessonId trên URL thay đổi)
  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        setLoading(true);
        const res = await lessonService.getLessonById(lessonId);
        setCurrentLesson(res.data);
        setIsVideoEnded(false);
      } catch (error) {
        console.error("Lỗi tải bài học:", error);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetchLessonContent();
  }, [lessonId]);

  // Hàm xử lý: Hoàn thành bài học & Next
  const handleCompleteLesson = async () => {
    try {
      // 1. Gọi API đánh dấu hoàn thành
      await progressService.markLessonCompleted(lessonId);
      
      // 2. Cập nhật state local (để hiện tick xanh ngay lập tức)
      if (!completedLessonIds.includes(Number(lessonId))) {
        setCompletedLessonIds(prev => [...prev, Number(lessonId)]);
      }

      // 3. Tự động chuyển sang bài tiếp theo
      goToNextLesson();
      
    } catch (error) {
      console.error("Lỗi completion:", error);
      alert("Có lỗi khi lưu tiến độ!");
    }
  };

  // Logic tìm bài tiếp theo
  const goToNextLesson = () => {
    const allLessons = [];
    chapters.forEach(chap => {
      if(chap.lessons) allLessons.push(...chap.lessons);
    });

    const currentIndex = allLessons.findIndex(l => l.lessonid === Number(lessonId));
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      navigate(`/learn/${courseId}/lesson/${nextLesson.lessonid}`);
    } else {
      alert("Chúc mừng! Bạn đã hoàn thành khóa học.");
    }
  };

  if (loading && !currentLesson) return <div className="p-10 text-center">Đang tải bài học...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      
      {/* KHUNG TRÁI: VIDEO PLAYER & NỘI DUNG */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-black w-full aspect-video flex items-center justify-center">
          {currentLesson?.videourl ? (
             // Kiểm tra nếu là link youtube/vimeo thì dùng iframe, nếu file mp4 thì dùng thẻ video
             currentLesson.videourl.includes('youtube') || currentLesson.videourl.includes('vimeo') ? (
                <iframe 
                    src={currentLesson.videourl.replace("watch?v=", "embed/")} 
                    title="Video bài học"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
             ) : (
                <video 
                  src={currentLesson.videourl} 
                  controls 
                  className="w-full h-full"
                  onEnded={() => setIsVideoEnded(true)}
                />
             )
          ) : (
            <div className="text-white">Bài học này không có video (Chỉ có văn bản)</div>
          )}
        </div>

        <div className="p-6 bg-white min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentLesson?.title}
            </h1>
            <button
              onClick={handleCompleteLesson}
              className={`px-6 py-2 rounded font-bold text-white transition-colors ${
                completedLessonIds.includes(Number(lessonId)) 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {completedLessonIds.includes(Number(lessonId)) ? 'Đã hoàn thành' : 'Hoàn thành & Tiếp tục'}
            </button>
          </div>

          <div className="prose max-w-none text-gray-700">
            {/* 2. Nội dung bài học */}
            <div dangerouslySetInnerHTML={{ __html: currentLesson?.content }} />
            
            {/* 3. Hiển thị Quiz nếu có (ĐÃ THÊM MỚI) */}
            {currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">📝</span> Bài kiểm tra
                </h3>
                
                <div className="space-y-6">
                  {currentLesson.quizzes.map(quiz => (
                    <QuizPlayer 
                      key={quiz.quizid} 
                      quizId={quiz.quizid} 
                      onComplete={() => {
                         // Logic: Nếu làm quiz qua điểm sàn -> Tự động hoàn thành bài học
                         if (!completedLessonIds.includes(Number(lessonId))) {
                            handleCompleteLesson(); 
                         }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* KHUNG PHẢI: SIDEBAR DANH SÁCH BÀI HỌC */}
      <div className="w-full md:w-80 bg-white border-l border-gray-200 overflow-y-auto h-auto md:h-full flex-shrink-0">
        <div className="p-4 border-b font-bold text-lg bg-gray-50 sticky top-0">
          Nội dung khóa học
        </div>
        
        <div className="divide-y divide-gray-100">
          {chapters.map((chapter, index) => (
            <div key={chapter.chapterid}>
              <div className="px-4 py-3 bg-gray-100 font-semibold text-sm text-gray-700 border-b border-gray-200">
                Chương {index + 1}: {chapter.title}
              </div>
              
              <ul>
                {chapter.lessons && chapter.lessons.map((lesson) => {
                  const isActive = lesson.lessonid === Number(lessonId);
                  const isCompleted = completedLessonIds.includes(lesson.lessonid);

                  return (
                    <li key={lesson.lessonid}>
                      <Link
                        to={`/learn/${courseId}/lesson/${lesson.lessonid}`}
                        className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                          isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${
                          isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-400 text-transparent'
                        }`}>
                          {isCompleted && <span className="text-xs">✓</span>}
                        </div>

                        <div className="flex-1">
                          <p className={`text-sm ${isActive ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                            {lesson.title}
                          </p>
                          <span className="text-xs text-gray-400">Video</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayerPage;