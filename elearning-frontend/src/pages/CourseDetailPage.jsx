import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { courseService, cartService, favoriteService, orderService, reviewService } from '../services';

/**
 * ReviewsSection - Component hiển thị đánh giá của khóa học
 */
const ReviewsSection = ({ courseId, isPurchased, isAuthenticated, setNotification }) => {
  const [showAll, setShowAll] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['courseReviews', courseId],
    queryFn: () => courseService.getCourseReviews(courseId),
    enabled: !!courseId,
  });

  // Fetch user's review if authenticated and purchased
  const { data: userReviewData } = useQuery({
    queryKey: ['userReview', courseId],
    queryFn: () => reviewService.getUserReview(courseId),
    enabled: !!courseId && isAuthenticated && isPurchased,
  });

  const userReview = userReviewData?.data?.data || null;
  const isEditing = !!userReview;

  // Set form values when user review is loaded
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating || 0);
      setComment(userReview.comment || '');
    }
  }, [userReview]);

  const reviews = reviewsData?.data?.data || reviewsData?.data || [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);
  const hasMoreReviews = reviews.length > 5;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setNotification({ 
        type: 'error', 
        message: 'Vui lòng chọn số sao đánh giá!' 
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
      return;
    }

      setIsSubmitting(true);
    try {
      if (isEditing) {
        await reviewService.updateReview(courseId, { rating, comment });
      } else {
        await reviewService.createReview(courseId, { rating, comment });
      }

      // Refresh reviews and user review
      queryClient.invalidateQueries(['courseReviews', courseId]);
      queryClient.invalidateQueries(['userReview', courseId]);
      
      setShowReviewForm(false);
      setNotification({ 
        type: 'success', 
        message: isEditing ? 'Đã cập nhật đánh giá thành công!' : 'Cảm ơn bạn đã đánh giá!' 
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setNotification({ 
        type: 'error', 
        message 
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, reviewId, interactive = false, onStarClick = null, onStarHover = null) => {
    const stars = [];
    const displayRating = interactive ? (hoverRating || rating) : rating;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 !== 0;
    const uniqueId = `half-fill-${reviewId || Math.random().toString(36).substr(2, 9)}`;
    const StarSize = interactive ? 'w-6 h-6' : 'w-4 h-4';

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= fullStars;
      const isHalf = i === fullStars + 1 && hasHalfStar;
      
      const starElement = (
        <svg 
          key={i}
          className={`${StarSize} ${isFilled ? 'text-yellow-400' : isHalf ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
            viewBox="0 0 20 20"
          >
          {isHalf ? (
            <>
          <defs>
            <linearGradient id={uniqueId}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path fill={`url(#${uniqueId})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </>
          ) : (
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          )}
        </svg>
      );

      if (interactive) {
      stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onStarClick && onStarClick(i)}
            onMouseEnter={() => onStarHover && onStarHover(i)}
            onMouseLeave={() => onStarHover && onStarHover(0)}
            className="cursor-pointer focus:outline-none"
          >
            {starElement}
          </button>
      );
      } else {
        stars.push(starElement);
      }
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh Giá</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh Giá ({reviews.length})</h2>
      
      {/* Review Form - Only show if user has purchased the course */}
      {isPurchased && isAuthenticated && (
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          {!showReviewForm ? (
            <div className="text-center">
                <button
                  onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                {isEditing ? 'Sửa đánh giá của bạn' : 'Viết đánh giá'}
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars(
                    rating, 
                    'review-form', 
                    true, 
                    (value) => setRating(value),
                    (value) => setHoverRating(value)
                  )}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {rating === 1 ? 'Rất tệ' : rating === 2 ? 'Tệ' : rating === 3 ? 'Bình thường' : rating === 4 ? 'Tốt' : 'Rất tốt'}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Bình luận (tùy chọn)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    if (!isEditing) {
                      setRating(0);
                      setComment('');
                    } else {
                      setRating(userReview?.rating || 0);
                      setComment(userReview?.comment || '');
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có đánh giá nào cho khóa học này.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {displayedReviews.map((review) => {
              const student = review.student || {};
              const studentName = student.fullname || 'Người dùng ẩn danh';
              const profilePicture = student.profilepicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=teal&color=fff&size=40`;
              const reviewRating = review.rating || 0;
              const reviewComment = review.comment || '';
              const createdAt = review.createdat || review.createdAt;
              const reviewId = review.reviewid || review.id || Math.random();

              return (
                <div key={reviewId} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      className="w-10 h-10 rounded-full object-cover" 
                      src={profilePicture} 
                      alt={studentName}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=teal&color=fff&size=40`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{studentName}</h4>
                        <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(reviewRating, reviewId)}
                    </div>
                    {reviewComment && (
                      <p className="text-gray-700">{reviewComment}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {hasMoreReviews && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {showAll ? 'Ẩn bớt' : `Hiển thị thêm (${reviews.length - 5} đánh giá)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true); // Thêm state để track việc kiểm tra trạng thái
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await courseService.getCourseById(id);
        const courseData = response.data?.data || response.data;
        setCourse(courseData);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi tải khóa học');
        console.error('CourseDetails - Error fetching course:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setNotification({ 
        type: 'error', 
        message: 'Vui lòng đăng nhập để thêm khóa học vào giỏ hàng' 
      });
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      navigate('/login');
      }, 2000);
      return;
    }

    // If already purchased, navigate to learning page
    if (isPurchased) {
      navigate(`/courses/${id}/learn`);
      return;
    }

    // If already in cart, navigate to cart page
    if (isInCart) {
      navigate('/cart');
      return;
    }

    // Add to cart
    try {
      setIsEnrolling(true);
      
      await cartService.addToCart({ courseId: Number(id) });
      setIsInCart(true);
      setNotification({ type: 'success', message: 'Đã thêm khóa học vào giỏ hàng thành công!' });
      
      // Redirect to cart page after showing notification
      setTimeout(() => {
        setNotification({ type: '', message: '' });
      navigate('/cart');
      }, 1500);
    } catch (err) {
      if (err?.response?.status === 401) {
        setNotification({ 
          type: 'error', 
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
        });
        setTimeout(() => {
          setNotification({ type: '', message: '' });
        navigate('/login');
        }, 2000);
        return;
      }
      const message = err?.response?.data?.message || err.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng';
      console.error('Error adding to cart:', err);
      setNotification({ type: 'error', message });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      setNotification({ 
        type: 'error', 
        message: 'Vui lòng đăng nhập để thêm khóa học vào yêu thích' 
      });
      setTimeout(() => {
        setNotification({ type: '', message: '' });
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      setIsAddingFavorite(true);
      
      if (isFavorite) {
        // Remove from favorites
        await favoriteService.removeFavorite(Number(id));
        setIsFavorite(false);
        setNotification({ type: 'success', message: 'Đã xóa khỏi yêu thích!' });
      } else {
        // Add to favorites
        await favoriteService.addToFavorites({ courseId: Number(id) });
        setIsFavorite(true);
        setNotification({ type: 'success', message: 'Đã thêm vào yêu thích!' });
      }
      
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      if (err?.response?.status === 401) {
        setNotification({ 
          type: 'error', 
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
        });
        setTimeout(() => {
          setNotification({ type: '', message: '' });
      navigate('/login');
        }, 2000);
        return;
      }
      const message = err?.response?.data?.message || err.message || 'Có lỗi xảy ra';
      setNotification({ type: 'error', message });
      setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    } finally {
      setIsAddingFavorite(false);
    }
  };

  // Check if course is in favorites, cart, or purchased
  useEffect(() => {
    const checkCourseStatus = async () => {
      setIsCheckingStatus(true); // Bắt đầu kiểm tra
      
      if (!isAuthenticated || !id) {
        // Reset states if not authenticated
        setIsFavorite(false);
        setIsInCart(false);
        setIsPurchased(false);
        setIsCheckingStatus(false); // Kết thúc kiểm tra
      return;
    }

      try {
        // Check favorites, cart, and orders in parallel để tăng tốc độ
        const [favoritesRes, cartRes, ordersRes] = await Promise.all([
          favoriteService.getFavorites().catch(() => ({ data: { data: [] } })),
          cartService.getCart().catch(() => ({ data: { data: [] } })),
          orderService.getUserOrders().catch(() => ({ data: { data: [] } }))
        ]);

        // Check favorites
        const favoriteList = favoritesRes?.data?.data || favoritesRes?.data || [];
        const isFav = favoriteList.some(fav => 
          (fav.courseid || fav.courseId) === Number(id) || 
          (fav.course?.courseid || fav.course?.courseId) === Number(id)
        );
        setIsFavorite(isFav);

        // Check cart
        const cartItems = cartRes?.data?.data || cartRes?.data || [];
        const inCart = cartItems.some(item => {
          const itemCourseId = item.courseid || item.courseId;
          const nestedCourseId = item.course?.courseid || item.course?.courseId;
          return itemCourseId === Number(id) || nestedCourseId === Number(id);
        });
        setIsInCart(inCart);

        // Check if purchased (check orders with status Completed)
        const orderList = ordersRes?.data?.data || ordersRes?.data || [];
        const purchased = orderList.some(order => {
          if (order.status !== 'Completed') return false;
          const orderDetails = order.orderdetails || [];
          return orderDetails.some(detail => 
            (detail.courseid || detail.courseId) === Number(id) ||
            (detail.course?.courseid || detail.course?.courseId) === Number(id)
          );
        });
        setIsPurchased(purchased);
      } catch (err) {
        // Silently fail - user might not have data yet
        console.error('Could not check course status:', err);
        // Set default values on error
        setIsFavorite(false);
        setIsInCart(false);
        setIsPurchased(false);
      } finally {
        setIsCheckingStatus(false); // Kết thúc kiểm tra
      }
    };

    // Chỉ check khi course đã được load
    if (course && !isLoading) {
    checkCourseStatus();
    }

    // Also check when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (isAuthenticated && id && course && !isLoading) {
        checkCourseStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
  };
  }, [isAuthenticated, id, course, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button onClick={() => navigate(-1)} 
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      {notification.message && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div
            className={`rounded-lg p-4 shadow-lg ${
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
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Side) */}
          <div className="lg:col-span-2">
            {/* Video Player Section */}
            <div className="mb-8">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <img 
                    src={course?.imageurl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop'}
                    alt={course?.coursename || 'Course'}
                    className="w-full h-full object-cover"
                  />
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all">
                      <i className="fas fa-play text-gray-800 text-2xl ml-1"></i>
                    </button>
                  </div>
                </div>
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="hover:text-teal-400 transition-colors">
                        <i className="fas fa-play text-lg"></i>
                      </button>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-600 rounded-full h-1">
                          <div className="bg-teal-500 h-1 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm">2:30 / 8:45</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="hover:text-teal-400 transition-colors">
                        <i className="fas fa-volume-up text-lg"></i>
                      </button>
                      <button className="hover:text-teal-400 transition-colors">
                        <i className="fas fa-cog text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Title and Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course?.coursename || 'Course Title'}
              </h1>
              
              {/* Instructor/Studio Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {course?.teacher?.fullname?.charAt(0) || 'K'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {course?.teacher?.fullname || 'Kitani Studio'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {course?.category?.categoryname || 'Design Studio'}
                    </p>
                  </div>
                </div>
                
                {/* Engagement Metrics */}
                <div className="flex items-center space-x-6 ml-auto">
                  <div className="flex items-center space-x-1">
                    <i className="fas fa-eye text-teal-500"></i>
                    <span className="text-sm text-gray-600">2.3k</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="fas fa-comment text-teal-500"></i>
                    <span className="text-sm text-gray-600">1.4k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Course Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới Thiệu Về Khóa Học</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">
                  {course?.description || 'NO DESCRIPTION'}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection 
              courseId={id} 
              isPurchased={isPurchased}
              isAuthenticated={isAuthenticated}
              setNotification={setNotification}
            />
          </div>

          {/* Sidebar (Right Side) */}
          <div className="lg:col-span-1">
            {/* Price and Purchase Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 sticky top-8">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(course?.price || 0)}
                  </span>
                  {course?.price && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(course.price * 1.2)}
                    </span>
                  )}
                </div>
                {course?.price && (
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium inline-block">
                  20% OFF
                </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {isCheckingStatus ? (
                  // Hiển thị skeleton loading khi đang kiểm tra trạng thái
                  <>
                    <div className="w-full py-3 px-4 rounded-lg bg-gray-200 animate-pulse"></div>
                    <div className="w-full py-3 px-4 rounded-lg bg-gray-200 animate-pulse"></div>
                  </>
                ) : (
                  <>
                <button 
                  onClick={handleAddToCart}
                  disabled={isEnrolling}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPurchased
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : isInCart
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isEnrolling 
                    ? 'Đang xử lý...' 
                    : isPurchased 
                    ? 'Học ngay' 
                    : isInCart 
                    ? 'Đi đến giỏ hàng' 
                    : 'Thêm vào giỏ hàng'}
                </button>
                
                <button 
                  onClick={handleAddToFavorites}
                  disabled={isAddingFavorite}
                  className={`w-full border py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorite
                      ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <i className={`fas fa-heart ${isFavorite ? 'text-red-500' : ''}`}></i>
                  <span>{isAddingFavorite ? 'Đang xử lý...' : isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>
                  </>
                )}
              </div>

              {/* Course Stats */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Khóa học này bao gồm:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {course?.duration && (
                    <li className="flex items-center space-x-2">
                      <i className="fas fa-clock text-teal-500"></i>
                      <span>Thời lượng: {course.duration}</span>
                    </li>
                  )}
                  {course?.chaptersCount > 0 && (
                    <li className="flex items-center space-x-2">
                      <i className="fas fa-book text-teal-500"></i>
                      <span>{course.chaptersCount} chương học</span>
                    </li>
                  )}
                  {course?.lessonsCount > 0 && (
                    <li className="flex items-center space-x-2">
                      <i className="fas fa-video text-teal-500"></i>
                      <span>{course.lessonsCount} bài học</span>
                    </li>
                  )}
                  {course?.level && (
                  <li className="flex items-center space-x-2">
                      <i className="fas fa-signal text-teal-500"></i>
                      <span>Cấp độ: {course.level}</span>
                  </li>
                  )}
                  {course?.language && (
                  <li className="flex items-center space-x-2">
                      <i className="fas fa-language text-teal-500"></i>
                      <span>Ngôn ngữ: {course.language}</span>
                  </li>
                  )}
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-teal-500"></i>
                    <span>Truy cập trọn đời</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-check text-teal-500"></i>
                    <span>Chứng chỉ hoàn thành</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
