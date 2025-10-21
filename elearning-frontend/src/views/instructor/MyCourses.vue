<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../../components/common/AppButton.vue'

const router = useRouter()

const filters = ref({
  search: '',
  status: '',
  category: ''
})

const courses = ref([
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Learn the basics of React development with hands-on projects and real-world examples.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    status: 'published',
    category: 'programming',
    students: 245,
    rating: 4.8,
    price: 99,
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts including closures, prototypes, and async programming.',
    imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop',
    status: 'published',
    category: 'programming',
    students: 189,
    rating: 4.9,
    price: 149,
    createdAt: '2024-01-10'
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of user interface and user experience design.',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
    status: 'draft',
    category: 'design',
    students: 0,
    rating: 0,
    price: 79,
    createdAt: '2024-01-20'
  }
])

const filteredCourses = computed(() => {
  let filtered = [...courses.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(search) ||
      course.description.toLowerCase().includes(search)
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(course => course.status === filters.value.status)
  }

  if (filters.value.category) {
    filtered = filtered.filter(course => course.category === filters.value.category)
  }

  return filtered
})

const totalStudents = computed(() => {
  return courses.value.reduce((total, course) => total + course.students, 0)
})

const totalRevenue = computed(() => {
  return courses.value.reduce((total, course) => total + (course.students * course.price), 0)
})

const createNewCourse = () => {
  router.push('/instructor/courses/create')
}

const editCourse = (course) => {
  router.push(`/instructor/courses/${course.id}/edit`)
}

const viewCourse = (course) => {
  router.push(`/courses/${course.id}`)
}

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  // TODO: Load courses from API
  console.log('Loading instructor courses...')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Courses</h1>
        <p class="text-gray-600">Manage your courses and track their performance</p>
      </div>
      <AppButton variant="primary" @click="createNewCourse">
        Create New Course
      </AppButton>
    </div>

    <!-- Course Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <v-icon name="hi-academic-cap" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Courses</p>
            <p class="text-2xl font-bold text-gray-900">{{ courses.length }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ totalStudents }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <v-icon name="hi-currency-dollar" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900">${{ totalRevenue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search courses..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            <option value="programming">Programming</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="course in filteredCourses" :key="course.id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Course Image -->
        <div class="relative">
          <img
            :src="course.imageUrl"
            :alt="course.title"
            class="w-full h-48 object-cover"
          />
          <div class="absolute top-3 right-3">
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                course.status === 'published' ? 'bg-green-100 text-green-800' :
                course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              ]"
            >
              {{ course.status }}
            </span>
          </div>
        </div>

        <!-- Course Content -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ course.title }}</h3>
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ course.description }}</p>

          <!-- Course Stats -->
          <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div class="flex items-center">
              <v-icon name="hi-users" class="w-4 h-4 mr-1" />
              {{ course.students }} students
            </div>
            <div class="flex items-center">
              <v-icon name="hi-star" class="w-4 h-4 mr-1 text-yellow-400" />
              {{ course.rating }}
            </div>
            <div class="font-medium text-teal-600">${{ course.price }}</div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <AppButton
              variant="outline"
              size="sm"
              @click="editCourse(course)"
              class="flex-1"
            >
              Edit
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              @click="viewCourse(course)"
              class="flex-1"
            >
              View
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCourses.length === 0" class="text-center py-12">
      <v-icon name="hi-academic-cap" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
      <p class="text-gray-600 mb-6">Get started by creating your first course.</p>
      <AppButton variant="primary" @click="createNewCourse">
        Create Your First Course
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
