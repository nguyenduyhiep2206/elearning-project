import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService, courseService, cloudinaryService } from '../services';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CourseLearningPage = () => {
  const { id: courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const lessonId = searchParams.get('lesson');
  const [selectedLessonId, setSelectedLessonId] = useState(lessonId ? parseInt(lessonId) : null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [signedVideoUrl, setSignedVideoUrl] = useState(null);

  // Fetch course content
  const { data: courseContentData, isLoading: isLoadingContent } = useQuery({
    queryKey: ['learning', 'course', courseId],
    queryFn: () => learningService.getCourseContent(courseId),
    enabled: !!courseId,
  });

  const courseContent = courseContentData?.data?.data;
  const course = courseContent?.course;
  const chapters = courseContent?.chapters || [];
  const progress = courseContent?.progress || { completedLessons: 0, totalLessons: 0, progressPercentage: 0 };

  // Fetch lesson details if selected
  const { data: lessonData, isLoading: isLoadingLesson } = useQuery({
    queryKey: ['learning', 'lesson', selectedLessonId],
    queryFn: () => learningService.getLesson(selectedLessonId),
    enabled: !!selectedLessonId,
  });

  const currentLesson = lessonData?.data?.data?.lesson;
  const navigation = lessonData?.data?.data?.navigation || {};

  // Fetch quizzes for current lesson
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['learning', 'quizzes', selectedLessonId],
    queryFn: () => learningService.getQuizzesByLesson(selectedLessonId),
    enabled: !!selectedLessonId,
  });

  const quizzes = quizzesData?.data?.data || [];

  // Fetch signed URL for Cloudinary videos
  const { data: signedUrlData, isLoading: isLoadingSignedUrl } = useQuery({
    queryKey: ['cloudinary', 'view-url', selectedLessonId],
    queryFn: () => cloudinaryService.getViewUrl(selectedLessonId, 3600), // 1 hour expiry
    enabled: !!selectedLessonId && !!currentLesson?.videourl,
    retry: 1,
    onSuccess: (response) => {
      const urlData = response?.data?.data;
      if (urlData?.isCloudinary && urlData?.url) {
        setSignedVideoUrl(urlData.url);
      } else {
        setSignedVideoUrl(null); // Use original URL for non-Cloudinary videos
      }
    },
    onError: () => {
      // Nếu lỗi, sử dụng URL gốc
      setSignedVideoUrl(null);
    },
  });

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (!selectedLessonId && chapters.length > 0) {
      const firstChapter = chapters[0];
      if (firstChapter?.lessons?.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        setSelectedLessonId(firstLesson.lessonid);
        setSearchParams({ lesson: firstLesson.lessonid });
        // Expand first chapter
        setExpandedChapters(new Set([firstChapter.chapterid]));
      }
    }
  }, [chapters, selectedLessonId, setSearchParams]);

  // Update URL when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      setSearchParams({ lesson: selectedLessonId });
    }
  }, [selectedLessonId, setSearchParams]);

  // Expand chapters that contain the selected lesson
  useEffect(() => {
    if (selectedLessonId && chapters.length > 0) {
      const chapterContainingLesson = chapters.find(chapter =>
        chapter.lessons.some(lesson => lesson.lessonid === selectedLessonId)
      );
      if (chapterContainingLesson) {
        setExpandedChapters(prev => new Set([...prev, chapterContainingLesson.chapterid]));
      }
    }
  }, [selectedLessonId, chapters]);

  // Reset signed URL when lesson changes
  useEffect(() => {
    setSignedVideoUrl(null);
  }, [selectedLessonId]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ lessonId, isCompleted }) => learningService.updateProgress(lessonId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning', 'course', courseId]);
      queryClient.invalidateQueries(['learning', 'lesson', selectedLessonId]);
    },
  });

  // Handle lesson completion
  const handleLessonComplete = () => {
    if (selectedLessonId) {
      updateProgressMutation.mutate({ lessonId: selectedLessonId, isCompleted: true });
      setNotification({ type: 'success', message: 'Đã đánh dấu bài học hoàn thành!' });
    }
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get lesson status
  const getLessonStatus = (lesson) => {
    if (lesson.lessonid === selectedLessonId) return 'playing';
    if (lesson.progress?.iscompleted) return 'completed';
    return 'pending';
  };

  // Detect video type and extract ID
  const getVideoInfo = (videoUrl) => {
    if (!videoUrl) return null;

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }

    // Direct video URL (mp4, webm, etc.)
    return { type: 'direct', url: videoUrl };
  };

  // Render video player based on type
  const renderVideoPlayer = () => {
    if (!currentLesson?.videourl) {
      return (
        <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-white text-lg">Chưa có video cho bài học này</p>
          </div>
        </div>
      );
    }

    // Sử dụng signed URL nếu có (cho Cloudinary), nếu không dùng URL gốc
    const videoUrl = signedVideoUrl || currentLesson.videourl;
    const videoInfo = getVideoInfo(videoUrl);

    if (videoInfo?.type === 'youtube') {
      return (
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="aspect-video">
            <iframe
              key={currentLesson.lessonid}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&rel=0`}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      );
    }

    if (videoInfo?.type === 'vimeo') {
      return (
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="aspect-video">
            <iframe
              key={currentLesson.lessonid}
              className="w-full h-full"
              src={`https://player.vimeo.com/video/${videoInfo.id}?autoplay=1`}
              title={currentLesson.title}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      );
    }

    // Direct video (MP4, WebM, etc.) - Sử dụng signed URL nếu là Cloudinary
    const finalVideoUrl = signedVideoUrl || currentLesson.videourl;
    
    // Hiển thị loading nếu đang fetch signed URL cho Cloudinary video
    if (isLoadingSignedUrl && currentLesson.videourl?.includes('cloudinary.com')) {
      return (
        <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Đang tải video...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
        <video
          key={`${currentLesson.lessonid}-${signedVideoUrl ? 'signed' : 'original'}`}
          className="w-full aspect-video"
          controls
          autoPlay
          onEnded={handleLessonComplete}
          controlsList="nodownload"
          preload="metadata"
        >
          <source src={finalVideoUrl} type="video/mp4" />
          <source src={finalVideoUrl} type="video/webm" />
          <source src={finalVideoUrl} type="video/ogg" />
          Trình duyệt của bạn không hỗ trợ video HTML5.
        </video>
      </div>
    );
  };

  if (isLoadingContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h1>
            <p className="text-gray-600 mb-6">Bạn chưa đăng ký khóa học này hoặc khóa học không tồn tại.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Về trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Notification Banner */}
      {notification.message && (
        <div
          className={`${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          } border-b px-4 py-3 text-center`}
        >
          {notification.message}
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="ml-4 text-sm underline"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {isLoadingLesson ? (
              <div className="bg-black aspect-video rounded-lg flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              renderVideoPlayer()
            )}

            {/* Course Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.coursename}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="font-medium">{course.teacher?.fullname}</span>
                <span>•</span>
                <span>{course.category?.categoryname}</span>
              </div>
            </div>

            {/* About Course */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Về khóa học</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description || 'Chưa có mô tả cho khóa học này.'}
              </p>
            </div>

            {/* Navigation Buttons */}
            {currentLesson && (
              <div className="flex gap-4 mb-8">
                {navigation.prevLesson ? (
                  <button
                    onClick={() => {
                      setSelectedLessonId(navigation.prevLesson.lessonid);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    ← Bài trước: {navigation.prevLesson.title}
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}
                {navigation.nextLesson ? (
                  <button
                    onClick={() => {
                      setSelectedLessonId(navigation.nextLesson.lessonid);
                    }}
                    className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                  >
                    Bài tiếp theo: {navigation.nextLesson.title} →
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            )}

            {/* Complete Lesson Button */}
            {currentLesson && !currentLesson.progress?.iscompleted && (
              <div className="mb-8">
                <button
                  onClick={handleLessonComplete}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  ✓ Đánh dấu hoàn thành
                </button>
              </div>
            )}

            {/* Quiz Section */}
            {currentLesson && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài tập trắc nghiệm</h2>
                {isLoadingQuizzes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Chưa có bài tập trắc nghiệm cho bài học này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <div key={quiz.quizid} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{quiz.questionsCount} câu hỏi</span>
                              {quiz.timelimit && <span>Thời gian: {quiz.timelimit} phút</span>}
                              {quiz.maxattempts && <span>Số lần làm: {quiz.maxattempts}</span>}
                            </div>
                            {quiz.bestScore !== null && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Điểm cao nhất: </span>
                                <span className="text-sm font-semibold text-teal-600">{quiz.bestScore.toFixed(1)}%</span>
                              </div>
                            )}
                            {quiz.latestSession && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Lần làm gần nhất: </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {new Date(quiz.latestSession.submittedat).toLocaleDateString('vi-VN')}
                                  {quiz.latestSession.score !== null && (
                                    <span className="ml-2 text-teal-600">({quiz.latestSession.score.toFixed(1)}%)</span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {quiz.canRetake ? (
                            <button
                              onClick={() => navigate(`/courses/${courseId}/learn/quiz/${quiz.quizid}`)}
                              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                            >
                              {quiz.latestSession ? 'Làm lại' : 'Bắt đầu làm bài'}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                            >
                              Đã đạt số lần làm tối đa
                            </button>
                          )}
                          {quiz.latestSession && (
                            <button
                              onClick={() => navigate(`/courses/${courseId}/learn/quiz/${quiz.quizid}/result`)}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                              Xem kết quả
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Curriculum */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nội dung khóa học</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tiến độ: {progress.completedLessons}/{progress.totalLessons} bài học</span>
                  <span>{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div key={chapter.chapterid} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleChapter(chapter.chapterid)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-900">{chapter.title}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedChapters.has(chapter.chapterid) ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedChapters.has(chapter.chapterid) && (
                      <div className="border-t border-gray-200">
                        {chapter.lessons.map((lesson) => {
                          const status = getLessonStatus(lesson);
                          return (
                            <button
                              key={lesson.lessonid}
                              onClick={() => setSelectedLessonId(lesson.lessonid)}
                              className={`w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition ${
                                status === 'playing' ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {status === 'completed' && (
                                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {status === 'playing' && (
                                  <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                )}
                                {status === 'pending' && (
                                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                )}
                                <span className={`text-sm ${status === 'playing' ? 'font-medium text-teal-700' : 'text-gray-700'}`}>
                                  {lesson.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin khóa học</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảng viên:</span>
                  <span className="font-medium text-gray-900">{course.teacher?.fullname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-medium text-gray-900">{course.category?.categoryname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số chương:</span>
                  <span className="font-medium text-gray-900">{chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số bài học:</span>
                  <span className="font-medium text-gray-900">{progress.totalLessons}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseLearningPage;
