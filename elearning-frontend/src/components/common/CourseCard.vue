<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '../../stores/course.store.js'

// Props để nhận courseId hoặc courseType
const props = defineProps({
  courseId: {
    type: Number,
    default: null
  },
  courseType: {
    type: String,
    default: 'latest', // 'popular', 'latest', 'all'
    validator: (value) => ['popular', 'latest', 'all'].includes(value)
  },
  limit: {
    type: Number,
    default: 8
  }
})

const courseStore = useCourseStore()

// Reactive data
const courses = ref([])
const isLoading = ref(false)
const error = ref(null)

// Fetch courses based on type
const fetchCourses = async () => {
  try {
    isLoading.value = true
    error.value = null

    if (props.courseId) {
      // Nếu có courseId, lấy course cụ thể
      const course = await courseStore.fetchCourseById(props.courseId)
      courses.value = [course]
    } else {
      // Nếu không có courseId, lấy danh sách theo type
      switch (props.courseType) {
        case 'popular':
          courses.value = await courseStore.fetchPopularCourses(props.limit)
          break
        case 'latest':
          courses.value = await courseStore.fetchLatestCourses(props.limit)
          break
        case 'all':
        default:
          const result = await courseStore.fetchCourses(1, props.limit)
          courses.value = result.courses
          break
      }
    }
  } catch (err) {
    error.value = err.message || 'Có lỗi xảy ra khi tải khóa học'
    console.error('Error fetching courses:', err)
  } finally {
    isLoading.value = false
  }
}

// Helper function để format price
const formatPrice = (price) => {
  return price ? price.toFixed(2) : '0.00'
}

// Helper function để get default instructor image
const getDefaultInstructorImage = () => {
  return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop'
}

// Lifecycle hook để fetch courses khi component được mount
onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="n in limit" :key="n" class="bg-white rounded-lg overflow-hidden shadow animate-pulse">
        <div class="h-48 bg-gray-300"></div>
        <div class="p-4">
          <div class="h-4 bg-gray-300 rounded mb-3"></div>
          <div class="h-6 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded mb-3"></div>
          <div class="flex justify-between">
            <div class="h-4 bg-gray-300 rounded w-16"></div>
            <div class="h-4 bg-gray-300 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-lg font-medium">{{ error }}</p>
      </div>
      <button @click="fetchCourses"
        class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
        Thử lại
      </button>
    </div>

    <!-- Courses Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="course in courses" :key="course.courseid || course.id"
        class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
        @click="$emit('course-click', course)">
        <!-- Image -->
        <div class="relative overflow-hidden h-48">
          <img
            :src="course.imageurl || course.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'"
            :alt="course.coursename || course.title"
            class="w-full h-full object-cover hover:scale-105 transition-transform" />
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Category Tag -->
          <div class="mb-3">
            <span class="text-white text-xs font-bold px-3 py-1 rounded-full">
              {{ course.category?.categoryname || course.category || 'COURSE' }}
            </span>

          </div>

          <!-- Title -->
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
            {{ course.coursename || course.title }}
          </h3>

          <!-- Instructor -->
          <div class="flex items-center gap-2 mb-3">
            <img :src="course.teacher?.avatar || course.instructorImage || getDefaultInstructorImage()"
              :alt="course.teacher?.fullname || course.instructorName" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-sm text-gray-600">
              {{ course.teacher?.fullname || course.instructorName || 'Instructor' }}
            </span>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="font-bold text-gray-900">${{ formatPrice(course.price) }}</span>
              <span v-if="course.originalprice || course.originalPrice" class="text-sm text-gray-500 line-through">
                ${{ formatPrice(course.originalprice || course.originalPrice) }}
              </span>
            </div>
            <div class="flex items-center gap-1 text-sm">
              <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path
                  d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span class="text-gray-600">({{ course.reviewcount || course.reviews || 0 }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !error && courses.length === 0" class="text-center py-8">
      <div class="text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
          </path>
        </svg>
        <p class="text-lg font-medium">Không có khóa học nào</p>
        <p class="text-sm">Hãy thử lại sau hoặc kiểm tra kết nối mạng</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
