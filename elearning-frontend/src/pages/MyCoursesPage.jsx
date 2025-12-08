import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningService, favoriteService } from '../services';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' hoặc 'favorites'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch cả hai loại khóa học song song
      const [enrolledRes, favoritesRes] = await Promise.all([
        learningService.getMyCourses({ page: 1, limit: 100 }).catch(() => ({ data: { data: { courses: [] } } })),
        favoriteService.getFavorites().catch(() => ({ data: { data: [] } }))
      ]);

      // Xử lý enrolled courses
      const enrolledResponse = enrolledRes.data?.data || {};
      const enrolledData = enrolledResponse.courses || enrolledResponse || [];
      
      // Xử lý favorites - mỗi item có structure { course: {...} }
      const favoritesData = favoritesRes.data?.data || favoritesRes.data || [];

      setEnrolledCourses(enrolledData);
      setFavoriteCourses(favoritesData);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải khóa học');
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (courseId) => {
    try {
      await favoriteService.removeFavorite(courseId);
      // Reload danh sách yêu thích
      const favoritesRes = await favoriteService.getFavorites();
      const favoritesData = favoritesRes.data?.data || favoritesRes.data || [];
      setFavoriteCourses(favoritesData);
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa khóa học khỏi yêu thích');
      console.error('Error removing favorite:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderCourseCard = (course, isEnrolled = false) => {
    // Xử lý cấu trúc dữ liệu khác nhau giữa enrolled và favorites
    let courseId, courseData, progress, isCompleted;
    
    if (isEnrolled) {
      // Enrolled courses: course object trực tiếp với progress
      courseId = course.courseid;
      courseData = course;
      progress = course.progress?.progressPercentage || 0;
      isCompleted = course.isCompleted || false;
    } else {
      // Favorites: course nằm trong favorite.course
      courseId = course.course?.courseid || course.courseid;
      courseData = course.course || course;
      progress = null;
      isCompleted = false;
    }
    
    return (
      <div 
        key={courseId || course.id} 
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/courses/${courseId}`)}
      >
        {/* Course Image */}
        <div className="relative">
          <img 
            src={courseData.imageurl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'}
            alt={courseData.coursename}
            className="w-full h-48 object-cover"
          />
          {isEnrolled && (
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Đã đăng ký
              </div>
              {isCompleted && (
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  ✓ Đã hoàn thành
                </div>
              )}
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {courseData.coursename || 'Khóa học'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            bởi {courseData.teacher?.fullname || 'Giảng viên'}
          </p>
          
          {/* Progress for enrolled courses */}
          {isEnrolled && progress !== null && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tiến độ</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <span className="text-sm text-gray-500">(4.8)</span>
            </div>
            <div className="text-lg font-bold text-teal-600">
              {courseData.price ? formatPrice(courseData.price) : 'Miễn phí'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {isEnrolled ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${courseId}/learn`);
                }}
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Tiếp tục học
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${courseId}`);
                }}
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Xem chi tiết
              </button>
            )}
            
            {!isEnrolled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(courseId);
                }}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Xóa khỏi yêu thích"
              >
                <i className="fas fa-heart-broken"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <p className="text-lg font-medium">{error}</p>
            </div>
            <button 
              onClick={fetchData}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mt-4">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCourses = activeTab === 'enrolled' ? enrolledCourses : favoriteCourses;
  const isEmpty = currentCourses.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa Học Của Tôi</h1>
          <p className="text-gray-600">Quản lý khóa học đã đăng ký và yêu thích</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Đã đăng ký ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-heart mr-2"></i>
              Yêu thích ({favoriteCourses.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <i className={`fas ${activeTab === 'enrolled' ? 'fa-book' : 'fa-heart'} text-6xl`}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'enrolled' 
                ? 'Chưa có khóa học nào' 
                : 'Chưa có khóa học yêu thích'}
            </h2>
            <p className="text-gray-600 mb-8">
              {activeTab === 'enrolled'
                ? 'Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký ngay!'
                : 'Bạn chưa thêm khóa học nào vào yêu thích. Hãy khám phá và thêm vào yêu thích!'}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCourses.map((course) => renderCourseCard(course, activeTab === 'enrolled'))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;

