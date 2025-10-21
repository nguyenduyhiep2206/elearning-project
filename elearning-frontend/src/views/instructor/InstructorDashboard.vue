<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'
import AppButton from '../../components/common/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { user } = authStore

const stats = ref({
  totalCourses: 12,
  totalStudents: 1250,
  averageRating: 4.8,
  totalEarnings: 15600
})

const recentCourses = ref([
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Learn the basics of React development',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
    students: 245,
    price: 99
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts',
    imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=300&h=200&fit=crop',
    students: 189,
    price: 149
  },
  {
    id: 3,
    title: 'Node.js Backend Development',
    description: 'Build robust backend applications',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
    students: 156,
    price: 199
  }
])

const recentReviews = ref([
  {
    id: 1,
    studentName: 'John Doe',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    courseTitle: 'React Fundamentals',
    rating: 5,
    comment: 'Excellent course! Very well explained and easy to follow.',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    courseTitle: 'Advanced JavaScript',
    rating: 4,
    comment: 'Great content, helped me understand complex concepts.',
    createdAt: '2024-01-14'
  }
])

const createNewCourse = () => {
  router.push('/instructor/courses/create')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadDashboardData()
})

const loadDashboardData = async () => {
  // TODO: Load real data from API
  console.log('Loading instructor dashboard data...')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ user?.name || 'Instructor' }}!</p>
      </div>
      <AppButton variant="primary" @click="createNewCourse">
        Create New Course
      </AppButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <v-icon name="hi-academic-cap" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Courses</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalCourses }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <v-icon name="hi-users" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Students</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalStudents }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <v-icon name="hi-star" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Average Rating</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.averageRating }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <v-icon name="hi-currency-dollar" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Earnings</p>
            <p class="text-2xl font-bold text-gray-900">${{ stats.totalEarnings }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Courses -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Recent Courses</h3>
          <router-link to="/instructor/courses" class="text-teal-600 hover:text-teal-700 text-sm font-medium">
            View All
          </router-link>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="course in recentCourses" :key="course.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <img
              :src="course.imageUrl"
              :alt="course.title"
              class="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 class="font-semibold text-gray-900 mb-2">{{ course.title }}</h4>
            <p class="text-sm text-gray-600 mb-3">{{ course.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">{{ course.students }} students</span>
              <span class="text-sm font-medium text-teal-600">${{ course.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reviews -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Recent Reviews</h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="review in recentReviews" :key="review.id" class="flex items-start space-x-4">
            <img
              :src="review.studentAvatar"
              :alt="review.studentName"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="font-medium text-gray-900">{{ review.studentName }}</h4>
                <div class="flex items-center">
                  <v-icon
                    v-for="star in 5"
                    :key="star"
                    name="hi-star"
                    :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="w-4 h-4"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ review.courseTitle }}</p>
              <p class="text-sm text-gray-700">{{ review.comment }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(review.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
