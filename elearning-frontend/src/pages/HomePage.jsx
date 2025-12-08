import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService, categoryService } from '../services';
import UserChatModal from './ChatBox'

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("user")) || {};
  setCurrentUser(stored.user || null);
}, []);

  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const categoryScrollRef = useRef(null);

  // Fetch categories từ API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  // Xử lý categories data
  const categories = categoriesData?.data?.data || categoriesData?.data || [];
  const allCategories = [
    { id: 'all', name: 'Tất cả' },
    ...categories.map(cat => ({
      id: cat.categoryid || cat.id,
      name: cat.categoryname || cat.name
    }))
  ];

  // State dữ liệu từ backend
  const [courses, setCourses] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [popularRes, latestRes] = await Promise.all([
          courseService.getPopularCourses(8),
          courseService.getLatestCourses(8)
        ]);

        const popularPayload = popularRes.data?.data || popularRes.data || [];
        const latestPayload = latestRes.data?.data || latestRes.data || [];

        const normalizeCourse = (c) => ({
          id: c.courseid ?? c.id,
          title: c.coursename ?? c.title,
          instructor: c.teacher?.fullname || 'Giảng viên chưa xác định',
          categoryName: c.category?.categoryname || '',
          price: c.price != null ? `${Number(c.price).toLocaleString('vi-VN')}đ` : '0đ',
          originalPrice: c.price != null ? `${(Number(c.price) * 1.2).toLocaleString('vi-VN')}đ` : '',
          image: c.imageurl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
          rating: typeof c.averageRating === 'number' ? Number(c.averageRating) : 0,
          reviews: typeof c.reviewCount === 'number' ? c.reviewCount : 0,
        });

        const popular = (Array.isArray(popularPayload) ? popularPayload : popularPayload?.courses || []).map(normalizeCourse);
        const latest = (Array.isArray(latestPayload) ? latestPayload : latestPayload?.courses || [])
          .map(normalizeCourse)
          // Sắp xếp khóa học thịnh hành theo số sao (rating) từ cao xuống thấp
          .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

        setCourses(popular);
        setTrendingCourses(latest);

        // Suy ra instructors từ danh sách khóa học phổ biến
        const teacherMap = new Map();
        for (const c of (Array.isArray(popularPayload) ? popularPayload : popularPayload?.courses || [])) {
          const id = c.teacher?.userid;
          const name = c.teacher?.fullname;
          const avatar = c.teacher?.profilepicture;
          if (id && name && !teacherMap.has(id)) {
            teacherMap.set(id, {
              id,
              name,
              profession: 'Giảng viên',
              image: avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face'
            });
          }
        }
        setInstructors(Array.from(teacherMap.values()).slice(0, 8));
      } catch (e) {
        setCourses([]);
        setTrendingCourses([]);
        setInstructors([]);
      }
    };
    loadData();
  }, []);

  // Functions cho category scroll
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300; // Số pixel scroll mỗi lần
      const newScrollLeft = categoryScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      categoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section với Video Background */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden max-w-7xl mx-auto shadow-2xl">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dhd3gr6dp/video/upload/v1764660506/dgsx972mwxome7eknd6u.mp4" type="video/mp4" />
          {/* Fallback image nếu video không load được */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop"
            alt="Education background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>

        {/* Overlay gradient để text dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-10 md:px-16">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Học điều mới mỗi ngày
              </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Trở thành chuyên gia và sẵn sàng tham gia thế giới với hàng nghìn khóa học chất lượng cao
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/search')}
                className="px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Khám phá Khóa học
              </button>
              <button
                onClick={() => navigate('/search')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="py-10 px-5 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto relative">
          {/* Left Scroll Button */}
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 transition-all duration-300"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Scroll Button */}
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 transition-all duration-300"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Scrollable Category List */}
          <div
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-10"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {allCategories.map((category) => {
              const isAll = category.id === 'all';
              const label = isAll ? 'Tất cả' : category.name;

              const handleClick = () => {
                setActiveFilter(label);
                // Điều hướng sang trang tìm kiếm với category tương ứng
                const params = new URLSearchParams();
                // Dùng label làm từ khóa để vẫn có kết quả tìm kiếm
                params.set('q', label);
                if (!isAll) {
                  params.set('category', category.id);
                }
                navigate(`/search?${params.toString()}`);
              };

              return (
            <button
              key={category.id}
                  onClick={handleClick}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeFilter === label
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="py-12 px-5 max-w-6xl mx-auto mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Khóa học nổi bật</h2>
            <p className="text-gray-600">
              Lựa chọn những khóa học được nhiều học viên yêu thích và đánh giá cao.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => {
            const rating = Number(course.rating || 0);
            const roundedRating = Math.round(rating);
            return (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                  {course.categoryName && (
                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700">
                      {course.categoryName}
                    </span>
                  )}
                <h3 className="text-lg font-bold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 mb-2">bởi {course.instructor}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <i
                          key={index}
                          className={`fas fa-star text-sm ${
                            index < roundedRating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-800">
                        {rating > 0 ? rating.toFixed(1) : '0.0'}
                      </span>
                  </div>
                    <span className="text-gray-500 text-sm">
                      ({course.reviews || 0} đánh giá)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{course.price}</span>
                  <span className="text-gray-500 line-through">{course.originalPrice}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Trending Course Section (Horizontal Slider) */}
      <div className="py-12 px-5 max-w-6xl mx-auto mt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Khóa học đang thịnh hành</h2>
            <p className="text-gray-600">
              Những khóa học mới, được nhiều học viên xem và đăng ký gần đây.
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {trendingCourses.map((course, index) => {
              const rating = Number(course.rating || 0);
              const roundedRating = Math.round(rating);
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="min-w-[260px] max-w-[280px] bg-gradient-to-b from-white to-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 scroll-snap-align-start border border-gray-100"
                >
                  <div className="relative h-40">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold shadow">
                      TOP {index + 1}
                </div>
                    {course.categoryName && (
                      <span className="absolute bottom-2 left-2 inline-block px-2 py-1 text-[11px] font-semibold rounded-full bg-black/60 text-white backdrop-blur-sm">
                        {course.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-1 text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">bởi {course.instructor}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star text-xs ${
                              i < roundedRating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                        <span className="ml-1 text-xs font-medium text-gray-800">
                          {rating > 0 ? rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({course.reviews || 0} đánh giá)
                      </span>
                </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-teal-600">{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{course.originalPrice}</span>
                      )}
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Instructor Section */}
      <div className="py-12 px-5 max-w-6xl mx-auto mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Giảng viên nổi tiếng</h2>
            <p className="text-gray-600">
              Gặp gỡ những giảng viên được yêu thích nhất, giàu kinh nghiệm và tận tâm.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <img src={instructor.image} alt={instructor.name} className="w-full h-48 object-cover" />
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold mb-1 text-gray-900">{instructor.name}</h3>
                <p className="text-gray-600">{instructor.profession}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
{currentUser && <UserChatModal user={currentUser} />}

    </div>
  );
};

export default HomePage;
