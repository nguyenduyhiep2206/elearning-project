<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store.js'

const authStore = useAuthStore()
const { user } = authStore

const stats = ref({
  totalUsers: 1250,
  totalCourses: 89,
  totalOrders: 342,
  revenue: 12500
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'hi-user-add',
    description: 'New user John Doe registered',
    time: '2 minutes ago'
  },
  {
    id: 2,
    icon: 'hi-academic-cap',
    description: 'Course "React Fundamentals" was published',
    time: '15 minutes ago'
  },
  {
    id: 3,
    icon: 'hi-shopping-bag',
    description: 'New order #1234 completed',
    time: '1 hour ago'
  },
  {
    id: 4,
    icon: 'hi-user',
    description: 'User profile updated',
    time: '2 hours ago'
  }
])

onMounted(() => {
  // Load dashboard data
  loadDashboardData()
})

const loadDashboardData = async () => {
  // TODO: Load real data from API
  console.log('Loading dashboard data...')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ user?.name || 'Admin' }}!</p>
      </div>
      <div class="text-sm text-gray-500">
        Last updated: {{ new Date().toLocaleDateString() }}
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <v-icon name="hi-users" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <v-icon name="hi-academic-cap" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Courses</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalCourses }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <v-icon name="hi-shopping-bag" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <v-icon name="hi-currency-dollar" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Revenue</p>
            <p class="text-2xl font-bold text-gray-900">${{ stats.revenue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Growth Chart -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p class="text-gray-500">Chart placeholder - User Growth</p>
        </div>
      </div>

      <!-- Course Categories -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Course Categories</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p class="text-gray-500">Chart placeholder - Course Categories</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <v-icon :name="activity.icon" class="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
