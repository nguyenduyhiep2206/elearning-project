import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService, cloudinaryService } from '../../services';

/**
 * CourseContent - Trang quản lý nội dung khóa học (chapters và lessons)
 */
const CourseContent = () => {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Modal states
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  
  // Form states
  const [chapterForm, setChapterForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '' });
  const [formErrors, setFormErrors] = useState({});
  
  // Video upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch courses
  const { data: coursesData } = useQuery({
    queryKey: ['teacher', 'courses'],
    queryFn: () => teacherService.getMyCourses({ page: 1, limit: 100 }),
  });

  // Fetch chapters
  const { data: chaptersData, isLoading: isLoadingChapters } = useQuery({
    queryKey: ['teacher', 'chapters', selectedCourseId],
    queryFn: () => teacherService.getChapters(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  const courses = coursesData?.data?.data?.courses || coursesData?.data?.courses || [];
  const chapters = chaptersData?.data?.data || chaptersData?.data || [];

  // Chapter mutations
  const createChapterMutation = useMutation({
    mutationFn: (data) => teacherService.createChapter(selectedCourseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setIsChapterModalOpen(false);
      resetChapterForm();
      setNotification({ type: 'success', message: 'Tạo chapter thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi tạo chapter: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: (data) => teacherService.updateChapter(editingChapter?.chapterid || editingChapter?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setIsChapterModalOpen(false);
      setEditingChapter(null);
      resetChapterForm();
      setNotification({ type: 'success', message: 'Cập nhật chapter thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi cập nhật chapter: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId) => teacherService.deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setNotification({ type: 'success', message: 'Xóa chapter thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi xóa chapter: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Lesson mutations
  const createLessonMutation = useMutation({
    mutationFn: (data) => teacherService.createLesson(selectedChapterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setIsLessonModalOpen(false);
      resetLessonForm();
      setNotification({ type: 'success', message: 'Tạo lesson thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi tạo lesson: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (data) => teacherService.updateLesson(editingLesson?.lessonid || editingLesson?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      resetLessonForm();
      setNotification({ type: 'success', message: 'Cập nhật lesson thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi cập nhật lesson: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId) => teacherService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher', 'chapters', selectedCourseId]);
      setNotification({ type: 'success', message: 'Xóa lesson thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi xóa lesson: ' + (error.response?.data?.message || error.message)
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleOpenChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({
        title: chapter.title || '',
        description: chapter.description || '',
      });
    } else {
      resetChapterForm();
      setEditingChapter(null);
    }
    setIsChapterModalOpen(true);
  };

  const handleOpenLessonModal = (chapterId, lesson = null) => {
    setSelectedChapterId(chapterId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title || '',
        content: lesson.content || '',
        videoUrl: lesson.videourl || lesson.videoUrl || '',
      });
    } else {
      resetLessonForm();
      setEditingLesson(null);
    }
    setIsLessonModalOpen(true);
  };

  const resetChapterForm = () => {
    setChapterForm({ title: '', description: '' });
    setFormErrors({});
  };

  const resetLessonForm = () => {
    setLessonForm({ title: '', content: '', videoUrl: '' });
    setFormErrors({});
  };

  const validateChapterForm = () => {
    const errors = {};
    if (!chapterForm.title.trim()) errors.title = 'Tên chapter không được để trống';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLessonForm = () => {
    const errors = {};
    if (!lessonForm.title.trim()) errors.title = 'Tên lesson không được để trống';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChapterSubmit = (e) => {
    e.preventDefault();
    if (!validateChapterForm()) return;

    if (editingChapter) {
      updateChapterMutation.mutate(chapterForm);
    } else {
      createChapterMutation.mutate(chapterForm);
    }
  };

  const handleLessonSubmit = (e) => {
    e.preventDefault();
    if (!validateLessonForm()) return;

    if (editingLesson) {
      updateLessonMutation.mutate(lessonForm);
    } else {
      createLessonMutation.mutate(lessonForm);
    }
  };

  const handleDeleteChapter = (chapterId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chapter này? Tất cả lessons trong chapter sẽ bị xóa.')) {
      deleteChapterMutation.mutate(chapterId);
    }
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lesson này?')) {
      deleteLessonMutation.mutate(lessonId);
    }
  };

  // Handle video file upload với signed upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setNotification({ type: 'error', message: 'Vui lòng chọn file video hợp lệ' });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setNotification({ type: 'error', message: 'File video không được vượt quá 500MB' });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Lấy signed upload signature từ backend
      const signatureResponse = await cloudinaryService.getUploadSignature({
        folder: `elearning/videos/course-${selectedCourseId}`,
        resourceType: 'video',
      });

      const { signature, timestamp, folder, resourceType, apiKey, cloudName, uploadUrl } = 
        signatureResponse.data.data;

      // Debug log
      console.log('📤 Uploading to Cloudinary:', {
        uploadUrl,
        folder,
        resourceType,
        timestamp,
        signature: signature.substring(0, 10) + '...', // Chỉ hiển thị 10 ký tự đầu
      });

      // 2. Tạo FormData để upload trực tiếp lên Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('resource_type', resourceType);
      // LƯU Ý: resource_type được gửi trong FormData nhưng KHÔNG có trong signature
      // vì nó đã có trong URL (/video/upload)

      // 3. Upload trực tiếp lên Cloudinary
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Lỗi khi upload video');
      }

      const uploadResult = await uploadResponse.json();

      // 4. Lấy secure URL từ Cloudinary response
      const videoUrl = uploadResult.secure_url || uploadResult.url;

      // 5. Cập nhật form với video URL
      setLessonForm({ ...lessonForm, videoUrl });

      setNotification({ type: 'success', message: 'Upload video thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading video:', error);
      setNotification({ 
        type: 'error', 
        message: 'Lỗi khi upload video: ' + (error.message || 'Vui lòng thử lại')
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.message && (
        <div
          className={`rounded-lg p-4 shadow-md ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý nội dung khóa học</h1>
        <p className="text-gray-600 mt-2">Quản lý chapters và lessons cho khóa học của bạn</p>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khóa học</label>
        <select
          value={selectedCourseId}
          onChange={(e) => {
            setSelectedCourseId(e.target.value);
            setExpandedChapters(new Set());
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">-- Chọn khóa học --</option>
          {courses.map((course) => (
            <option key={course.courseid || course.id} value={course.courseid || course.id}>
              {course.coursename}
            </option>
          ))}
        </select>
      </div>

      {/* Chapters List */}
      {selectedCourseId && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Chương</h2>
            <button
              onClick={() => handleOpenChapterModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Thêm Chương</span>
            </button>
          </div>

          {isLoadingChapters ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : chapters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Chưa có chapter nào. Hãy thêm chapter đầu tiên!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chapters.map((chapter) => {
                const chapterId = chapter.chapterid || chapter.id;
                const isExpanded = expandedChapters.has(chapterId);
                const lessons = chapter.lessons || [];

                return (
                  <div key={chapterId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleChapter(chapterId)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                          {chapter.description && (
                            <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenLessonModal(chapterId)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          + Bài học
                        </button>
                        <button
                          onClick={() => handleOpenChapterModal(chapter)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapterId)}
                          disabled={deleteChapterMutation.isPending}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="mt-4 ml-8 space-y-2">
                        {lessons.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">Chưa có lesson nào</p>
                        ) : (
                          lessons.map((lesson) => {
                            const lessonId = lesson.lessonid || lesson.id;
                            return (
                              <div
                                key={lessonId}
                                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  {lesson.videourl && (
                                    <p className="text-xs text-gray-500 mt-1">Video: {lesson.videourl}</p>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedLessonId(lessonId);
                                      setIsQuizModalOpen(true);
                                    }}
                                    className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                                  >
                                    Quiz
                                  </button>
                                  <button
                                    onClick={() => handleOpenLessonModal(chapterId, lesson)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(lessonId)}
                                    disabled={deleteLessonMutation.isPending}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingChapter ? 'Chỉnh sửa Chapter' : 'Tạo Chapter mới'}
              </h2>
              <button
                onClick={() => {
                  setIsChapterModalOpen(false);
                  resetChapterForm();
                  setEditingChapter(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleChapterSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Chapter <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
                    placeholder="Nhập tên chapter"
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập mô tả chapter"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsChapterModalOpen(false);
                    resetChapterForm();
                    setEditingChapter(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createChapterMutation.isPending || updateChapterMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingChapter
                    ? updateChapterMutation.isPending
                      ? 'Đang cập nhật...'
                      : 'Cập nhật'
                    : createChapterMutation.isPending
                    ? 'Đang tạo...'
                    : 'Tạo Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingLesson ? 'Chỉnh sửa Lesson' : 'Tạo Bài học mới'}
              </h2>
              <button
                onClick={() => {
                  setIsLessonModalOpen(false);
                  resetLessonForm();
                  setEditingLesson(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLessonSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Lesson <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className={`w-full px-3 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none`}
                    placeholder="Nhập tên lesson"
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập nội dung lesson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video
                  </label>
                  
                  {/* File Upload */}
                  <div className="mb-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <p className="mb-2 text-sm text-gray-500">
                              Đang upload... {uploadProgress > 0 && `${uploadProgress}%`}
                            </p>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click để upload video</span> hoặc kéo thả
                            </p>
                            <p className="text-xs text-gray-500">MP4, WebM, MOV (Tối đa 500MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {/* URL Input (hoặc nhập URL trực tiếp) */}
                  <div className="relative">
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Hoặc nhập URL video (YouTube, Vimeo, hoặc URL trực tiếp)"
                      disabled={isUploading}
                    />
                    {lessonForm.videoUrl && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Video URL:</span> {lessonForm.videoUrl}
                      </div>
                    )}
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Bạn có thể upload video trực tiếp lên Cloudinary hoặc nhập URL từ YouTube, Vimeo, hoặc URL trực tiếp
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    resetLessonForm();
                    setEditingLesson(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingLesson
                    ? updateLessonMutation.isPending
                      ? 'Đang cập nhật...'
                      : 'Cập nhật'
                    : createLessonMutation.isPending
                    ? 'Đang tạo...'
                    : 'Tạo bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Management Modal */}
      {isQuizModalOpen && selectedLessonId && (
        <QuizManagementModal
          lessonId={selectedLessonId}
          onClose={() => {
            setIsQuizModalOpen(false);
            setSelectedLessonId(null);
          }}
          setNotification={setNotification}
        />
      )}
    </div>
  );
};

/**
 * QuizManagementModal - Component quản lý quiz cho một lesson
 */
const QuizManagementModal = ({ lessonId, onClose, setNotification }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'results'
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    timeLimit: '',
    showAnswersAfterSubmission: false,
    maxAttempts: 1,
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
  });

  // Fetch quizzes
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['quizzes', lessonId],
    queryFn: () => teacherService.getQuizzesByLesson(lessonId),
    enabled: !!lessonId && activeTab === 'quizzes',
  });

  // Fetch selected quiz details
  const { data: quizDetailsData, isLoading: isLoadingQuizDetails, error: quizDetailsError } = useQuery({
    queryKey: ['quiz', selectedQuizId],
    queryFn: () => {
      const id = Number(selectedQuizId);
      if (isNaN(id)) {
        throw new Error('Invalid quiz ID');
      }
      return teacherService.getQuizById(id);
    },
    enabled: !!selectedQuizId && activeTab === 'quizzes' && !isNaN(Number(selectedQuizId)),
  });

  // Fetch quiz results
  const { data: quizResultsData } = useQuery({
    queryKey: ['quizResults', selectedQuizId],
    queryFn: () => {
      const id = Number(selectedQuizId);
      if (isNaN(id)) {
        throw new Error('Invalid quiz ID');
      }
      return teacherService.getQuizResults(id);
    },
    enabled: !!selectedQuizId && activeTab === 'results' && !isNaN(Number(selectedQuizId)),
  });

  const quizzes = quizzesData?.data?.data || [];
  const quizDetails = quizDetailsData?.data?.data || null;
  const quizResults = quizResultsData?.data?.data || [];

  // Quiz mutations
  const createQuizMutation = useMutation({
    mutationFn: (data) => teacherService.createQuiz(lessonId, data),
    onSuccess: (response) => {
      const newQuiz = response?.data?.data;
      const newQuizId = newQuiz?.quizid || newQuiz?.id;
      queryClient.invalidateQueries(['quizzes', lessonId]);
      setIsQuizFormOpen(false);
      resetQuizForm();
      // Tự động chọn quiz vừa tạo
      if (newQuizId) {
        setSelectedQuizId(Number(newQuizId));
      }
      setNotification({ type: 'success', message: 'Tạo quiz thành công! Bạn có thể thêm câu hỏi ngay bây giờ.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi tạo quiz: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: (data) => teacherService.updateQuiz(editingQuiz?.quizid || editingQuiz?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes', lessonId]);
      queryClient.invalidateQueries(['quiz', editingQuiz?.quizid || editingQuiz?.id]);
      setIsQuizFormOpen(false);
      setEditingQuiz(null);
      resetQuizForm();
      setNotification({ type: 'success', message: 'Cập nhật quiz thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi cập nhật quiz: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId) => teacherService.deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes', lessonId]);
      setNotification({ type: 'success', message: 'Xóa quiz thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi xóa quiz: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: (data) => {
      const id = Number(selectedQuizId);
      if (isNaN(id)) {
        throw new Error('Vui lòng chọn quiz trước khi thêm câu hỏi!');
      }
      return teacherService.createQuestion(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', selectedQuizId]);
      setIsQuestionFormOpen(false);
      resetQuestionForm();
      setNotification({ type: 'success', message: 'Tạo câu hỏi thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi tạo câu hỏi: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data) =>
      teacherService.updateQuestion(editingQuestion?.questionid || editingQuestion?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', selectedQuizId]);
      setIsQuestionFormOpen(false);
      setEditingQuestion(null);
      resetQuestionForm();
      setNotification({ type: 'success', message: 'Cập nhật câu hỏi thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi cập nhật câu hỏi: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId) => teacherService.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', selectedQuizId]);
      setNotification({ type: 'success', message: 'Xóa câu hỏi thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi xóa câu hỏi: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ sessionId, score }) => teacherService.updateQuizScore(sessionId, score),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizResults', selectedQuizId]);
      setNotification({ type: 'success', message: 'Cập nhật điểm thành công!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: 'Lỗi khi cập nhật điểm: ' + (error.response?.data?.message || error.message),
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    },
  });

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      timeLimit: '',
      showAnswersAfterSubmission: false,
      maxAttempts: 1,
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    });
  };

  const handleOpenQuizForm = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title || '',
        timeLimit: quiz.timelimit || '',
        showAnswersAfterSubmission: quiz.showanswersaftersubmission || false,
        maxAttempts: quiz.maxattempts || 1,
      });
    } else {
      setEditingQuiz(null);
      resetQuizForm();
    }
    setIsQuizFormOpen(true);
  };

  const handleOpenQuestionForm = (question = null) => {
    // Kiểm tra xem đã chọn quiz chưa
    if (!question && !selectedQuizId) {
      setNotification({ type: 'error', message: 'Vui lòng chọn quiz trước khi thêm câu hỏi!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }
    
    if (question) {
      setEditingQuestion(question);
      const options = question.options || [];
      setQuestionForm({
        questionText: question.questiontext || '',
        options: options.map((opt) => opt.optiontext || '').concat(['', '', '', '']).slice(0, 4),
        correctOptionIndex: options.findIndex((opt) => opt.optionid === question.correctoptionid) >= 0 
          ? options.findIndex((opt) => opt.optionid === question.correctoptionid) 
          : 0,
        explanation: question.explanation || '',
      });
    } else {
      setEditingQuestion(null);
      resetQuestionForm();
    }
    setIsQuestionFormOpen(true);
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập tên quiz!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }

    if (editingQuiz) {
      updateQuizMutation.mutate(quizForm);
    } else {
      createQuizMutation.mutate(quizForm);
    }
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập nội dung câu hỏi!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }

    const validOptions = questionForm.options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setNotification({ type: 'error', message: 'Vui lòng nhập ít nhất 2 lựa chọn!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }

    if (editingQuestion) {
      updateQuestionMutation.mutate({
        questionText: questionForm.questionText,
        options: validOptions,
        correctOptionIndex: questionForm.correctOptionIndex,
        explanation: questionForm.explanation,
      });
    } else {
      createQuestionMutation.mutate({
        questionText: questionForm.questionText,
        options: validOptions,
        correctOptionIndex: questionForm.correctOptionIndex,
        explanation: questionForm.explanation,
      });
    }
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quiz này? Tất cả câu hỏi sẽ bị xóa.')) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleUpdateScore = (sessionId, newScore) => {
    if (newScore < 0 || newScore > 100) {
      setNotification({ type: 'error', message: 'Điểm phải từ 0 đến 100!' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }
    updateScoreMutation.mutate({ sessionId, score: newScore });
  };

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Quiz</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab('quizzes');
                setSelectedQuizId(null);
              }}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Danh sách Quiz
            </button>
            <button
              onClick={() => {
                if (selectedQuizId) {
                  setActiveTab('results');
                } else {
                  setNotification({ type: 'error', message: 'Vui lòng chọn quiz để xem kết quả!' });
                  setTimeout(() => setNotification({ type: '', message: '' }), 3000);
                }
              }}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kết quả làm bài
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'quizzes' ? (
            <div className="space-y-4">
              {/* Quiz List */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Danh sách Quiz</h3>
                <button
                  onClick={() => handleOpenQuizForm()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Tạo Quiz mới
                </button>
              </div>

              {isLoadingQuizzes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có quiz nào. Hãy tạo quiz đầu tiên!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => {
                    const quizId = quiz.quizid || quiz.id;
                    const isSelected = selectedQuizId === quizId;
                    return (
                      <div
                        key={quizId}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const id = Number(quizId);
                          if (!isNaN(id)) {
                            setSelectedQuizId(id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              {quiz.timelimit && <span>Thời gian: {quiz.timelimit} phút</span>}
                              <span>Số lần làm: {quiz.maxattempts}</span>
                              <span>
                                Câu hỏi: {quiz.questions?.length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenQuizForm(quiz);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuiz(quizId);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quiz Details & Questions */}
              {selectedQuizId ? (
                isLoadingQuizDetails ? (
                  <div className="mt-6 border-t pt-6">
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Đang tải thông tin quiz...</p>
                    </div>
                  </div>
                ) : quizDetailsError ? (
                  <div className="mt-6 border-t pt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-600">Lỗi khi tải thông tin quiz. Vui lòng thử lại.</p>
                    </div>
                  </div>
                ) : quizDetails ? (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Câu hỏi: {quizDetails.title}</h3>
                      <button
                        onClick={() => handleOpenQuestionForm()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Thêm câu hỏi</span>
                      </button>
                    </div>

                  {quizDetails.questions?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizDetails.questions?.map((question, index) => {
                        const questionId = question.questionid || question.id;
                        const correctOption = question.options?.find(
                          (opt) => opt.optionid === question.correctoptionid
                        );
                        return (
                          <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold text-gray-700">Câu {index + 1}:</span>
                                  <span className="text-gray-900">{question.questiontext}</span>
                                </div>
                                <div className="ml-6 space-y-1">
                                  {question.options?.map((option, optIndex) => {
                                    const isCorrect = option.optionid === question.correctoptionid;
                                    return (
                                      <div
                                        key={option.optionid || optIndex}
                                        className={`flex items-center space-x-2 ${
                                          isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'
                                        }`}
                                      >
                                        <span>{String.fromCharCode(65 + optIndex)}.</span>
                                        <span>{option.optiontext}</span>
                                        {isCorrect && (
                                          <span className="text-xs bg-green-100 px-2 py-0.5 rounded">Đúng</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {question.explanation && (
                                  <div className="mt-2 ml-6 text-sm text-gray-500 italic">
                                    Giải thích: {question.explanation}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleOpenQuestionForm(question)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(questionId)}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                ) : null
              ) : (
                <div className="mt-6 border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa chọn quiz</h4>
                    <p className="text-gray-600 mb-4">
                      Vui lòng chọn một quiz từ danh sách ở trên để xem và thêm câu hỏi.
                    </p>
                    {quizzes.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Hoặc tạo quiz mới bằng cách nhấn nút <strong>"+ Tạo Quiz mới"</strong> ở trên.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Kết quả làm bài: {quizDetails?.title}</h3>
              {quizResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Chưa có học viên nào làm bài quiz này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizResults.map((session) => {
                    const sessionId = session.sessionid || session.id;
                    const student = session.student || {};
                    const answers = session.answers || [];
                    const correctCount = answers.filter((ans) => ans.iscorrect).length;
                    const totalQuestions = answers.length;
                    const score = session.score !== null ? session.score : (correctCount / totalQuestions) * 100;

                    return (
                      <div key={sessionId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {student.fullname || 'Người dùng ẩn danh'}
                            </h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Nộp bài: {new Date(session.submittedat || session.startedat).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">
                              {correctCount}/{totalQuestions} câu đúng
                            </div>
                          </div>
                        </div>

                        {/* Score Input */}
                        <div className="flex items-center space-x-2 mb-4">
                          <label className="text-sm font-medium text-gray-700">Điểm (0-100):</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            defaultValue={score}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                            onBlur={(e) => {
                              const newScore = parseFloat(e.target.value);
                              if (!isNaN(newScore) && newScore !== score) {
                                handleUpdateScore(sessionId, newScore);
                              }
                            }}
                          />
                        </div>

                        {/* Answers Detail */}
                        <div className="space-y-2">
                          {answers.map((answer, index) => {
                            const question = answer.question || {};
                            const selectedOption = answer.selectedOption || {};
                            const correctOption = question.options?.find(
                              (opt) => opt.optionid === question.correctoptionid
                            );
                            const isCorrect = answer.iscorrect;

                            return (
                              <div
                                key={answer.answerid || index}
                                className={`p-3 rounded ${
                                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}
                              >
                                <div className="font-medium text-sm mb-1">
                                  Câu {index + 1}: {question.questiontext}
                                </div>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="font-medium">Đã chọn:</span>{' '}
                                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                      {selectedOption.optiontext}
                                    </span>
                                  </div>
                                  {!isCorrect && (
                                    <div>
                                      <span className="font-medium">Đáp án đúng:</span>{' '}
                                      <span className="text-green-600">{correctOption?.optiontext}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Form Modal */}
      {isQuizFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingQuiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}</h3>
              <button
                onClick={() => {
                  setIsQuizFormOpen(false);
                  resetQuizForm();
                  setEditingQuiz(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleQuizSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Quiz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên quiz"
                  required
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian làm bài (phút)</label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Để trống nếu không giới hạn"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lần làm tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.maxAttempts}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAnswers"
                  checked={quizForm.showAnswersAfterSubmission}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, showAnswersAfterSubmission: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showAnswers" className="ml-2 text-sm text-gray-700">
                  Hiển thị đáp án sau khi nộp bài
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuizFormOpen(false);
                    resetQuizForm();
                    setEditingQuiz(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingQuiz ? 'Cập nhật' : 'Tạo Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {isQuestionFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingQuestion ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới'}
              </h3>
              <button
                onClick={() => {
                  setIsQuestionFormOpen(false);
                  resetQuestionForm();
                  setEditingQuestion(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                  </label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung câu hỏi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Các lựa chọn</label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                      type="radio"
                      name="correctOption"
                      checked={questionForm.correctOptionIndex === index}
                      onChange={() => setQuestionForm({ ...questionForm, correctOptionIndex: index })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                    />
                </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích (tùy chọn)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập giải thích cho đáp án đúng"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuestionFormOpen(false);
                    resetQuestionForm();
                    setEditingQuestion(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingQuestion ? 'Cập nhật' : 'Thêm Câu hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContent;

