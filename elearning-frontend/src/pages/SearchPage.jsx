import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService, categoryService } from '../services';
import Layout from '../components/Layout';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  });

  const categories = categoriesData?.data?.data || categoriesData?.data || [];

  // Đồng bộ state với URL (để Header / Home / các nơi khác điều hướng vào SearchPage hoạt động đúng)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';

    setSearchQuery(q);
    setCurrentPage(page);
    setSelectedCategory(category);
    setSortBy(sort);
  }, [searchParams]);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['searchCourses', searchQuery, currentPage, selectedCategory, sortBy],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { courses: [], totalCount: 0, totalPages: 0, currentPage: 1 };
      }
      const response = await courseService.searchCourses(searchQuery, currentPage, limit);
      return response.data?.data || { courses: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: 30000,
  });

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    let courses = searchResults?.courses || [];
    
    // Filter by category
    if (selectedCategory) {
      courses = courses.filter(course => 
        course.category?.categoryid === parseInt(selectedCategory)
      );
    }

    // Sort courses
    switch (sortBy) {
      case 'price-low':
        courses = [...courses].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        courses = [...courses].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        courses = [...courses].sort((a, b) => 
          new Date(b.createdat || 0) - new Date(a.createdat || 0)
        );
        break;
      case 'relevance':
      default:
        // Keep original order (sorted by search_score from backend)
        courses = [...courses].sort((a, b) => (b.search_score || 0) - (a.search_score || 0));
        break;
    }

    return courses;
  }, [searchResults?.courses, selectedCategory, sortBy]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (sortBy !== 'relevance') {
      params.set('sort', sortBy);
    }
    setSearchParams(params, { replace: true });
  }, [searchQuery, currentPage, selectedCategory, sortBy, setSearchParams]);

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle filter changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const courses = filteredAndSortedCourses;
  const totalCount = courses.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  
  // Paginate courses
  const paginatedCourses = courses.slice((currentPage - 1) * limit, currentPage * limit);

  // Loading Skeleton Component
  const CourseSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm khóa học</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khóa học (ví dụ: React, Lập trình Web, JavaScript...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                  <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Search Info & Controls */}
            {searchQuery.trim() && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                      Đang tìm kiếm...
                    </span>
                  ) : courses.length > 0 ? (
                    <span>
                      Tìm thấy <strong className="text-teal-600">{courses.length}</strong> khóa học cho từ khóa "<strong>{searchQuery}</strong>"
                    </span>
                  ) : (
                    <span>
                      Không tìm thấy kết quả cho từ khóa "<strong>{searchQuery}</strong>"
                    </span>
                  )}
                </div>

                {/* View Toggle & Sort */}
                {courses.length > 0 && (
                  <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        title="Grid view"
                      >
                        <i className="fas fa-th"></i>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        title="List view"
                      >
                        <i className="fas fa-list"></i>
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="relevance">Sắp xếp: Độ liên quan</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="newest">Mới nhất</option>
                    </select>

                    {/* Filter Toggle (Mobile) */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <i className="fas fa-filter mr-2"></i>
                      Lọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {courses.length > 0 && (
              <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="md:hidden text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Danh mục</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => handleCategoryChange('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          !selectedCategory
                            ? 'bg-teal-50 text-teal-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Tất cả danh mục
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.categoryid}
                          onClick={() => handleCategoryChange(category.categoryid.toString())}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.categoryid.toString()
                              ? 'bg-teal-50 text-teal-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {category.categoryname}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedCategory) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-times-circle mr-2"></i>
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CourseSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p>Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.</p>
                </div>
              )}

              {/* No Results */}
              {!isLoading && !error && searchQuery.trim() && courses.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                  <div className="text-gray-400 mb-4">
                    <i className="fas fa-search text-6xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-600 mb-6">
                    Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="text-sm text-gray-500">Gợi ý:</span>
                    {['React', 'JavaScript', 'Python', 'Lập trình Web'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}

              {/* Search Results */}
              {!isLoading && !error && courses.length > 0 && (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
                    : 'space-y-4 mb-8'
                  }>
                    {paginatedCourses.map((course) => (
                      <Link
                        key={course.courseid}
                        to={`/courses/${course.courseid}`}
                        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        {/* Course Image */}
                        <div className={`relative ${viewMode === 'list' ? 'w-64 h-48 flex-shrink-0' : 'h-48'} bg-gray-200`}>
                          {course.imageurl ? (
                            <img
                              src={course.imageurl}
                              alt={course.coursename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600">
                              <i className="fas fa-book text-white text-4xl"></i>
                            </div>
                          )}
                          {course.search_score && course.search_score > 0.1 && (
                            <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                              {Math.round(course.search_score * 100)}% khớp
                            </div>
                          )}
                        </div>

                        {/* Course Info */}
                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {course.coursename}
                          </h3>
                          <p className={`text-sm text-gray-600 mb-3 ${viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {course.teacher?.profilepicture ? (
                                <img
                                  src={course.teacher.profilepicture}
                                  alt={course.teacher.fullname}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">
                                  {course.teacher?.fullname?.[0] || 'T'}
                                </div>
                              )}
                              <span className="text-xs text-gray-600">
                                {course.teacher?.fullname || 'Giảng viên'}
                              </span>
                            </div>
                            <div className="text-teal-600 font-semibold">
                              {course.price ? (
                                <>
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(course.price)}
                                </>
                              ) : (
                                'Miễn phí'
                              )}
                            </div>
                          </div>
                          {course.category && (
                            <div className="mt-2">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {course.category.categoryname}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => {
                          const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  currentPage === page
                                    ? 'bg-teal-500 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Empty State - No search query */}
              {!searchQuery.trim() && !isLoading && (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                  <div className="text-gray-400 mb-4">
                    <i className="fas fa-search text-6xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhập từ khóa để tìm kiếm</h3>
                  <p className="text-gray-600 mb-6">
                    Tìm kiếm khóa học theo tên, mô tả hoặc lĩnh vực. Hệ thống hỗ trợ tìm kiếm mờ và bỏ dấu tiếng Việt.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-sm text-gray-500">Gợi ý tìm kiếm:</span>
                    {['React', 'JavaScript', 'Python', 'Lập trình Web', 'Thiết kế UI/UX'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setCurrentPage(1);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
