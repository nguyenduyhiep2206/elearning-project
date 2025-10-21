<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'
import { useCourseStore } from '../stores/course.store.js'
import NewsletterSignup from '../components/common/NewsletterSignup.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const { isLoggedIn } = authStore
const { enrollInCourse: storeEnrollInCourse } = courseStore

const isEnrolling = ref(false)
const course = ref(null)
const isLoading = ref(true)
const error = ref(null)

const isEnrolled = computed(() => {
  return courseStore.isEnrolled(route.params.id)
})

const enrollInCourse = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  if (isEnrolled.value) {
    router.push(`/courses/${route.params.id}/learn`)
    return
  }

  isEnrolling.value = true
  try {
    const result = await storeEnrollInCourse(route.params.id)
    if (result.success) {
      router.push(`/courses/${route.params.id}/learn`)
    } else {
      console.error('Enrollment failed:', result.error)
    }
  } catch (error) {
    console.error('Enrollment error:', error)
  } finally {
    isEnrolling.value = false
  }
}

const fetchCourse = async (courseId) => {
  try {
    isLoading.value = true
    error.value = null
    course.value = null
    
    console.log('CourseDetails - Fetching course with ID:', courseId)
    const result = await courseStore.fetchCourseById(courseId)
    course.value = result
    console.log('CourseDetails - Course fetched:', result)
  } catch (err) {
    error.value = err.message || 'Có lỗi xảy ra khi tải khóa học'
    console.error('CourseDetails - Error fetching course:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCourse(route.params.id)
})

// Watch for route changes
watch(() => route.params.id, (newId, oldId) => {
  console.log('CourseDetails - Route changed from', oldId, 'to', newId)
  if (newId && newId !== oldId) {
    fetchCourse(newId)
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Đang tải khóa học...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-red-600 mb-4">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium">{{ error }}</p>
        </div>
        <button @click="$router.go(-1)" 
          class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
          Quay lại
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content (Left Side) -->
        <div class="lg:col-span-2">
          <!-- Video Player Section -->
          <div class="mb-8">
            <div class="relative bg-gray-900 rounded-lg overflow-hidden">
              <div class="aspect-video bg-gray-800 flex items-center justify-center">
                <img 
                  :src="course?.imageurl || course?.imageUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop'"
                  :alt="course?.coursename || course?.title"
                  class="w-full h-full object-cover"
                />
                <!-- Video Overlay -->
                <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button class="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all">
                    <svg class="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Video Controls -->
              <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <button class="hover:text-teal-400 transition-colors">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    <div class="flex items-center space-x-2">
                      <div class="w-32 bg-gray-600 rounded-full h-1">
                        <div class="bg-teal-500 h-1 rounded-full" style="width: 30%"></div>
                      </div>
                      <span class="text-sm">2:30 / 8:45</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <button class="hover:text-teal-400 transition-colors">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </button>
                    <button class="hover:text-teal-400 transition-colors">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Title and Info -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">
              {{ course?.coursename || course?.title || 'Course Title' }}
            </h1>
            
            <!-- Instructor/Studio Info -->
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-bold">
                    {{ course?.teacher?.fullname?.charAt(0) || 'K' }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ course?.teacher?.fullname || 'Kitani Studio' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ course?.category?.categoryname || 'Design Studio' }}
                  </p>
                </div>
              </div>
              
              <!-- Engagement Metrics -->
              <div class="flex items-center space-x-6 ml-auto">
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  <span class="text-sm text-gray-600">
                    {{ course?.enrollmentcount || course?.viewCount || '2.3k' }}
                  </span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                  <span class="text-sm text-gray-600">
                    {{ course?.reviewcount || course?.reviewCount || '1.4k' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- About Course Section -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">About Course</h2>
            <div class="prose max-w-none">
              <p class="text-gray-700 mb-4">
                {{ course?.description || 'Vue.js is a progressive JavaScript framework for building user interfaces and Single-Page Applications (SPAs). It is designed to be incrementally adoptable, with a core library that focuses on the view layer only.' }}
              </p>
              <p class="text-gray-700">
                {{ course?.fullDescription || 'In this comprehensive course, you\'ll learn Vue.js from scratch, covering everything from basic concepts to advanced techniques. You\'ll build real-world applications and understand the Vue ecosystem including Vue Router, Vuex, and more.' }}
              </p>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
            <div class="space-y-6">
              <!-- Review 1 -->
              <div class="flex space-x-4">
                <div class="flex-shrink-0">
                  <img class="w-10 h-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop" alt="Leonardo Da Vinci">
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">Leonardo Da Vinci</h4>
                    <span class="text-sm text-gray-500">Today</span>
                  </div>
                  <p class="text-gray-700">Excellent course! Very well structured and easy to follow. The instructor explains complex concepts in a simple way.</p>
                </div>
              </div>

              <!-- Review 2 -->
              <div class="flex space-x-4">
                <div class="flex-shrink-0">
                  <img class="w-10 h-10 rounded-full" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop" alt="Titania S">
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">Titania S</h4>
                    <span class="text-sm text-gray-500">Today</span>
                  </div>
                  <p class="text-gray-700">Great content and practical examples. I learned a lot about Vue.js fundamentals.</p>
                </div>
              </div>

              <!-- Review 3 -->
              <div class="flex space-x-4">
                <div class="flex-shrink-0">
                  <img class="w-10 h-10 rounded-full" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" alt="Zhirkov">
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">Zhirkov</h4>
                    <span class="text-sm text-gray-500">Today</span>
                  </div>
                  <p class="text-gray-700">Perfect for beginners. The step-by-step approach makes learning Vue.js enjoyable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (Right Side) -->
        <div class="lg:col-span-1">
          <!-- Price and Purchase Section -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 sticky top-8">
            <!-- Price -->
            <div class="mb-4">
              <div class="flex items-baseline space-x-2 mb-2">
                <span class="text-3xl font-bold text-gray-900">${{ course?.price || '22.40' }}</span>
                <span v-if="course?.originalprice" class="text-lg text-gray-500 line-through">${{ course.originalprice }}</span>
              </div>
              <div class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium inline-block">
                20% OFF
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 mb-6">
              <button 
                @click="enrollInCourse"
                :disabled="isEnrolling"
                class="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isEnrolling">Đang xử lý...</span>
                <span v-else-if="isEnrolled">Vào học ngay</span>
                <span v-else>Đăng ký khóa học</span>
              </button>
              
              <button class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Thêm vào giỏ hàng
              </button>
            </div>

            <!-- Course Stats -->
            <div class="border-t pt-4">
              <h3 class="font-medium text-gray-900 mb-3">Khóa học này bao gồm:</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>8 giờ video HD</span>
                </li>
                <li class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>12 bài tập thực hành</span>
                </li>
                <li class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Truy cập trọn đời</span>
                </li>
                <li class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Chứng chỉ hoàn thành</span>
                </li>
                <li class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>Hỗ trợ 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Promotional Banner -->
    <NewsletterSignup v-if="!isLoading && !error" />
  </div>
</template>