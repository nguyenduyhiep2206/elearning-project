import { defineStore } from 'pinia'
import { courseService } from '../services/course.service.js'

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [],
    currentCourse: null,
    enrolledCourses: [],
    instructorCourses: [],
    categories: [],
    searchResults: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 12,
    },
    filters: {
      category: '',
      level: '',
      priceRange: '',
      rating: '',
      search: '',
    },
  }),

  getters: {
    // Get courses by category
    coursesByCategory: (state) => (category) => {
      return state.courses.filter(course => course.category === category)
    },

    // Get featured courses
    featuredCourses: (state) => {
      return state.courses.filter(course => course.isFeatured)
    },

    // Get popular courses
    popularCourses: (state) => {
      return state.courses
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 8)
    },

    // Get recent courses
    recentCourses: (state) => {
      return state.courses
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)
    },

    // Get filtered courses
    filteredCourses: (state) => {
      let filtered = [...state.courses]

      if (state.filters.category) {
        filtered = filtered.filter(course => course.category === state.filters.category)
      }

      if (state.filters.level) {
        filtered = filtered.filter(course => course.level === state.filters.level)
      }

      if (state.filters.priceRange) {
        const [min, max] = state.filters.priceRange.split('-').map(Number)
        filtered = filtered.filter(course => {
          const price = course.price
          return price >= min && (max ? price <= max : true)
        })
      }

      if (state.filters.rating) {
        const minRating = Number(state.filters.rating)
        filtered = filtered.filter(course => course.rating >= minRating)
      }

      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase()
        filtered = filtered.filter(course =>
          course.title.toLowerCase().includes(searchTerm) ||
          course.description.toLowerCase().includes(searchTerm) ||
          course.instructorName.toLowerCase().includes(searchTerm)
        )
      }

      return filtered
    },

    // Check if user is enrolled in course
    isEnrolled: (state) => (courseId) => {
      return state.enrolledCourses.some(course => course.id === courseId)
    },

    // Get course progress
    getCourseProgress: (state) => (courseId) => {
      const enrolledCourse = state.enrolledCourses.find(course => course.id === courseId)
      return enrolledCourse?.progress || 0
    },
  },

  actions: {
    // Fetch all courses
    async fetchCourses(page = 1, limit = 12, search = '', categoryId = null) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.fetchCourses(page, limit, search, categoryId)
        
        if (result.success) {
          this.courses = result.data.courses || result.data
          this.pagination = {
            currentPage: result.data.currentPage || 1,
            totalPages: result.data.totalPages || 1,
            totalItems: result.data.totalCount || result.data.length,
            itemsPerPage: limit,
          }
          return result.data
        } else {
          this.error = result.error
          throw new Error(result.error)
        }
      } catch (error) {
        this.error = 'Failed to fetch courses'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Fetch popular courses
    async fetchPopularCourses(limit = 8) {
      try {
        const result = await courseService.fetchPopularCourses(limit)
        
        if (result.success) {
          return result.data
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        throw error
      }
    },

    // Fetch latest courses
    async fetchLatestCourses(limit = 8) {
      try {
        const result = await courseService.fetchLatestCourses(limit)
        
        if (result.success) {
          return result.data
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        throw error
      }
    },

    // Fetch course by ID
    async fetchCourseById(courseId) {
      try {
        const result = await courseService.fetchCourseById(courseId)
        
        if (result.success) {
          this.currentCourse = result.data
          return result.data
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        throw error
      }
    },

    // Create new course
    async createCourse(courseData) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.createCourse(courseData)
        
        if (result.success) {
          this.courses.unshift(result.data)
          return { success: true, data: result.data }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to create course'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Update course
    async updateCourse(courseId, courseData) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.updateCourse(courseId, courseData)
        
        if (result.success) {
          const index = this.courses.findIndex(course => course.id === courseId)
          if (index !== -1) {
            this.courses[index] = result.data
          }
          
          if (this.currentCourse?.id === courseId) {
            this.currentCourse = result.data
          }
          
          return { success: true, data: result.data }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to update course'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Delete course
    async deleteCourse(courseId) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.deleteCourse(courseId)
        
        if (result.success) {
          this.courses = this.courses.filter(course => course.id !== courseId)
          
          if (this.currentCourse?.id === courseId) {
            this.currentCourse = null
          }
          
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to delete course'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Fetch enrolled courses
    async fetchEnrolledCourses() {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.getEnrolledCourses()
        
        if (result.success) {
          this.enrolledCourses = result.data
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to fetch enrolled courses'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Fetch instructor courses
    async fetchInstructorCourses() {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.getInstructorCourses()
        
        if (result.success) {
          this.instructorCourses = result.data
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to fetch instructor courses'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Enroll in course
    async enrollInCourse(courseId) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.enrollInCourse(courseId)
        
        if (result.success) {
          // Add to enrolled courses
          const course = this.courses.find(c => c.id === courseId)
          if (course) {
            this.enrolledCourses.push(course)
          }
          
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to enroll in course'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Unenroll from course
    async unenrollFromCourse(courseId) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.unenrollFromCourse(courseId)
        
        if (result.success) {
          this.enrolledCourses = this.enrolledCourses.filter(course => course.id !== courseId)
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to unenroll from course'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Search courses
    async searchCourses(query, filters = {}) {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.searchCourses(query, filters)
        
        if (result.success) {
          this.searchResults = result.data
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Search failed'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Fetch categories
    async fetchCategories() {
      this.isLoading = true
      this.error = null

      try {
        const result = await courseService.getCategories()
        
        if (result.success) {
          this.categories = result.data
          return { success: true }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Failed to fetch categories'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Set filters
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // Clear filters
    clearFilters() {
      this.filters = {
        category: '',
        level: '',
        priceRange: '',
        rating: '',
        search: '',
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Clear current course
    clearCurrentCourse() {
      this.currentCourse = null
    },
  },
})
