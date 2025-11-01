import api from './api';

// User API services
export const userService = {
  // Lấy danh sách tất cả users
  getAllUsers: () => api.get('/users'),
  
  // Lấy thông tin user theo ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Tạo user mới
  createUser: (userData) => api.post('/users', userData),
  
  // Cập nhật user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Xóa user
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Đăng nhập
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Đăng ký
  register: (userData) => api.post('/auth/register', userData),
  
  // Lấy thông tin user hiện tại
  getCurrentUser: () => api.get('/auth/me'),
};

// Course API services
export const courseService = {
  // Lấy danh sách tất cả courses
  getAllCourses: () => api.get('/courses'),
  
  // Lấy thông tin course theo ID
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  // Tạo course mới
  createCourse: (courseData) => api.post('/courses', courseData),
  
  // Cập nhật course
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  
  // Xóa course
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Tìm kiếm courses
  searchCourses: (query) => api.get(`/courses/search?q=${query}`),
};

// Category API services
export const categoryService = {
  // Lấy danh sách tất cả categories
  getAllCategories: () => api.get('/categories'),
  
  // Lấy thông tin category theo ID
  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  // Tạo category mới
  createCategory: (categoryData) => api.post('/categories', categoryData),
  
  // Cập nhật category
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  // Xóa category
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Order API services
export const orderService = {
  // Lấy danh sách orders của user
  getUserOrders: () => api.get('/orders'),
  
  // Tạo order mới
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Lấy thông tin order theo ID
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  // Cập nhật trạng thái order
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Cart API services
export const cartService = {
  // Lấy giỏ hàng của user
  getCart: () => api.get('/cart'),
  
  // Thêm item vào giỏ hàng
  addToCart: (itemData) => api.post('/cart', itemData),
  
  // Cập nhật số lượng item trong giỏ hàng
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  
  // Xóa item khỏi giỏ hàng
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  
  // Xóa toàn bộ giỏ hàng
  clearCart: () => api.delete('/cart'),
};
