import api from './api';

export const userService = {
  getAllUsers: () => api.get('/users'),
  
  getUserById: (id) => api.get(`/users/${id}`),
  
  createUser: (userData) => api.post('/users', userData),
  
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  login: (credentials) => api.post('/auth/login', credentials),
  
  register: (userData) => api.post('/auth/register', userData),
  
  getCurrentUser: () => api.get('/auth/me'),

  loginWithGoogle:() => api.get('/auth/google'),
};

export const courseService = {
  getAllCourses: () => api.get('/courses'),
  // Lấy khóa học phổ biến
  getPopularCourses: (limit = 8) => api.get(`/courses/popular`, { params: { limit } }),
  // Lấy khóa học mới nhất
  getLatestCourses: (limit = 8) => api.get(`/courses/latest`, { params: { limit } }),
  
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  createCourse: (courseData) => api.post('/courses', courseData),
  
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Lấy đánh giá của khóa học
  getCourseReviews: (courseId) => api.get(`/reviews/${courseId}`),
  
  // Tìm kiếm courses
  searchCourses: (query) => api.get(`/courses/search?q=${query}`),
};

// Review API services
export const reviewService = {
  // Lấy danh sách đánh giá của khóa học
  getCourseReviews: (courseId) => api.get(`/reviews/${courseId}`),
  
  // Lấy đánh giá của user cho một khóa học
  getUserReview: (courseId) => api.get(`/reviews/${courseId}/my-review`),
  
  // Tạo đánh giá mới
  createReview: (courseId, data) => api.post(`/reviews/${courseId}`, data),
  
  // Cập nhật đánh giá
  updateReview: (courseId, data) => api.put(`/reviews/${courseId}`, data),
};

// Category API services
export const categoryService = {
  getAllCategories: () => api.get('/categories'),
  

  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  createCategory: (categoryData) => api.post('/categories', categoryData),
  
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const orderService = {
  getUserOrders: () => api.get('/orders'),
  
  createOrder: (orderData) => api.post('/orders', orderData),
  
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  
  // Hủy đơn hàng
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (itemData) => api.post('/cart', itemData),
  
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  
  clearCart: () => api.delete('/cart'),
};

// Favorite API services
export const favoriteService = {
  // Lấy danh sách yêu thích của user
  getFavorites: () => api.get('/favorites'),
  
  // Thêm khóa học vào yêu thích
  addToFavorites: (data) => api.post('/favorites', data),
  
  // Xóa khóa học khỏi yêu thích
  removeFavorite: (courseId) => api.delete(`/favorites/${courseId}`),
};

// Admin API services
export const adminService = {
  // Lấy thống kê tổng quan
  fetchDashboardStats: () => api.get('/stats/overview'),
  
  // Lấy dữ liệu biểu đồ doanh thu
  fetchRevenueChart: (range) => api.get(`/stats/revenue-chart?range=${range}`),
  
  // Lấy danh sách khóa học chờ duyệt
  fetchPendingCourses: () => api.get('/admin/pending-courses'),
  
  // Duyệt khóa học
  approveCourse: (courseId) => api.post(`/admin/approve-course/${courseId}`),
  
  // Từ chối khóa học
  rejectCourse: (courseId) => api.post(`/admin/reject-course/${courseId}`),
  
  // Lấy tất cả đơn hàng (cho admin)
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  
  // Lấy chi tiết đơn hàng (cho admin)
  getOrderById: (orderId) => api.get(`/admin/orders/${orderId}`),
  
  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),
  
  // Lấy tất cả đánh giá (cho admin)
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  
  // Xóa đánh giá
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
  
  // Lấy tất cả mã giảm giá (cho admin)
  getAllPromotions: (params) => api.get('/admin/promotions', { params }),
  
  // Lấy chi tiết mã giảm giá
  getPromotionById: (promotionId) => api.get(`/admin/promotions/${promotionId}`),
  
  // Tạo mã giảm giá mới
  createPromotion: (data) => api.post('/admin/promotions', data),
  
  // Cập nhật mã giảm giá
  updatePromotion: (promotionId, data) => api.put(`/admin/promotions/${promotionId}`, data),
  
  // Xóa mã giảm giá
  deletePromotion: (promotionId) => api.delete(`/admin/promotions/${promotionId}`),
};

// Teacher API services
export const teacherService = {
  // Lấy thống kê của teacher
  getStats: () => api.get('/teacher/stats'),
  
  // Lấy danh sách khóa học của teacher
  getMyCourses: (params) => api.get('/teacher/courses', { params }),
  
  // Lấy chi tiết khóa học của teacher
  getCourseById: (courseId) => api.get(`/teacher/courses/${courseId}`),
  
  // Tạo khóa học mới
  createCourse: (data) => api.post('/teacher/courses', data),
  
  // Cập nhật khóa học
  updateCourse: (courseId, data) => api.put(`/teacher/courses/${courseId}`, data),
  
  // Xóa khóa học
  deleteCourse: (courseId) => api.delete(`/teacher/courses/${courseId}`),
  
  // Lấy danh sách học viên đã đăng ký khóa học
  getStudents: (params) => api.get('/teacher/students', { params }),
  
  // Chapters
  getChapters: (courseId) => api.get(`/teacher/courses/${courseId}/chapters`),
  createChapter: (courseId, data) => api.post(`/teacher/courses/${courseId}/chapters`, data),
  updateChapter: (chapterId, data) => api.put(`/teacher/chapters/${chapterId}`, data),
  deleteChapter: (chapterId) => api.delete(`/teacher/chapters/${chapterId}`),
  
  // Lessons
  getLessons: (chapterId) => api.get(`/teacher/chapters/${chapterId}/lessons`),
  createLesson: (chapterId, data) => api.post(`/teacher/chapters/${chapterId}/lessons`, data),
  updateLesson: (lessonId, data) => api.put(`/teacher/lessons/${lessonId}`, data),
  deleteLesson: (lessonId) => api.delete(`/teacher/lessons/${lessonId}`),
  
  // Quizzes
  getQuizzesByLesson: (lessonId) => api.get(`/teacher/lessons/${lessonId}/quizzes`),
  getQuizById: (quizId) => api.get(`/teacher/quizzes/${quizId}`),
  createQuiz: (lessonId, data) => api.post(`/teacher/lessons/${lessonId}/quizzes`, data),
  updateQuiz: (quizId, data) => api.put(`/teacher/quizzes/${quizId}`, data),
  deleteQuiz: (quizId) => api.delete(`/teacher/quizzes/${quizId}`),
  
  // Quiz Questions
  createQuestion: (quizId, data) => api.post(`/teacher/quizzes/${quizId}/questions`, data),
  updateQuestion: (questionId, data) => api.put(`/teacher/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/teacher/questions/${questionId}`),
  
  // Quiz Results
  getQuizResults: (quizId) => api.get(`/teacher/quizzes/${quizId}/results`),
  updateQuizScore: (sessionId, score) => api.put(`/teacher/quiz-sessions/${sessionId}/score`, { score }),
};

// Learning API services
export const learningService = {
  // Lấy thông tin khóa học với chapters và lessons
  getCourseContent: (courseId) => api.get(`/learning/courses/${courseId}`),
  
  // Lấy thông tin lesson cụ thể
  getLesson: (lessonId) => api.get(`/learning/lessons/${lessonId}`),
  
  // Cập nhật tiến độ học
  updateProgress: (lessonId, isCompleted) => api.put(`/learning/lessons/${lessonId}/progress`, { isCompleted }),
  
  // Lấy danh sách khóa học đã đăng ký
  getMyCourses: (params) => api.get('/learning/my-courses', { params }),
  
  // Quiz services
  getQuizzesByLesson: (lessonId) => api.get(`/learning/lessons/${lessonId}/quizzes`),
  startQuiz: (quizId) => api.post(`/learning/quizzes/${quizId}/start`),
  getCurrentSession: (quizId) => api.get(`/learning/quizzes/${quizId}/session`),
  submitAnswer: (sessionId, questionId, selectedOptionId) => 
    api.post(`/learning/sessions/${sessionId}/answers`, { questionId, selectedOptionId }),
  submitQuiz: (sessionId) => api.post(`/learning/sessions/${sessionId}/submit`),
  getQuizResult: (quizId) => api.get(`/learning/quizzes/${quizId}/result`),
};

// Cloudinary API services
export const cloudinaryService = {
  // Lấy signed upload signature cho giảng viên
  getUploadSignature: (data) => api.post('/cloudinary/upload-signature', data),
  
  // Lấy signed view URL cho học viên
  getViewUrl: (lessonId, expiresIn) => api.get(`/cloudinary/view-url/${lessonId}`, { 
    params: expiresIn ? { expiresIn } : {} 
  }),
};

export const messagesServices={
  sendMessage: (data) => api.post('/message', data),
  getMessages: (userId) => api.get(`/message/${userId}`),
  getChatUsers: () => api.get('/message'),
  markSeen: (data) => api.post('/message/seen', data),
}

// Export VNPAY service
export { default as vnpayService } from './vnpay.service';
