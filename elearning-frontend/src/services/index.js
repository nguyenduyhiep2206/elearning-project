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
  
  getCourseById: (id) => api.get(`/courses/${id}`),
  
  createCourse: (courseData) => api.post('/courses', courseData),
  
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  searchCourses: (query) => api.get(`/courses/search?q=${query}`),
};

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
};

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (itemData) => api.post('/cart', itemData),
  
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  
  clearCart: () => api.delete('/cart'),
};
