import api from './axios.js'

export const courseService = {
  // Get all courses
  async fetchCourses(page = 1, limit = 12, search = '', categoryId = null) {
    try {
      const params = { page, limit }
      if (search) params.search = search
      if (categoryId) params.categoryId = categoryId
      
      const response = await api.get('/courses', { params })
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch courses',
      }
    }
  },

  // Get popular courses
  async fetchPopularCourses(limit = 8) {
    try {
      const response = await api.get('/courses/popular', { params: { limit } })
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch popular courses',
      }
    }
  },

  // Get latest courses
  async fetchLatestCourses(limit = 8) {
    try {
      const response = await api.get('/courses/latest', { params: { limit } })
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch latest courses',
      }
    }
  },

  // Get course by ID
  async fetchCourseById(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course',
      }
    }
  },

  // Create new course (instructor only)
  async createCourse(courseData) {
    try {
      const response = await api.post('/courses', courseData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create course',
      }
    }
  },

  // Update course (instructor only)
  async updateCourse(courseId, courseData) {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update course',
      }
    }
  },

  // Delete course (instructor only)
  async deleteCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete course',
      }
    }
  },

  // Get instructor's courses
  async getInstructorCourses() {
    try {
      const response = await api.get('/courses/instructor/my-courses')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch instructor courses',
      }
    }
  },

  // Get student's enrolled courses
  async getEnrolledCourses() {
    try {
      const response = await api.get('/courses/student/enrolled')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch enrolled courses',
      }
    }
  },

  // Enroll in course
  async enrollInCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to enroll in course',
      }
    }
  },

  // Unenroll from course
  async unenrollFromCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}/enroll`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unenroll from course',
      }
    }
  },

  // Search courses
  async searchCourses(query, filters = {}) {
    try {
      const response = await api.get('/courses/search', {
        params: { q: query, ...filters },
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed',
      }
    }
  },

  // Get course categories
  async getCategories() {
    try {
      const response = await api.get('/courses/categories')
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories',
      }
    }
  },

  // Get course reviews
  async getCourseReviews(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/reviews`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews',
      }
    }
  },

  // Add course review
  async addCourseReview(courseId, reviewData) {
    try {
      const response = await api.post(`/courses/${courseId}/reviews`, reviewData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add review',
      }
    }
  },
}
