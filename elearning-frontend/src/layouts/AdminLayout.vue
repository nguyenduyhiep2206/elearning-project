<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.store.js'

const authStore = useAuthStore()
const { user, logout } = authStore

const isSidebarOpen = ref(false)
const isUserMenuOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  isUserMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isSidebarOpen.value = false
}

const handleLogout = () => {
  logout()
}

// Close menus when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">A</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>

          <!-- Admin Actions -->
          <div class="flex items-center gap-4">
            <button
              @click="toggleSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <v-icon name="hi-menu" class="w-6 h-6" />
            </button>
            
            <!-- User Menu -->
            <div class="relative">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
              >
                <img
                  :src="user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'"
                  :alt="user?.name || 'Admin Avatar'"
                  class="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
                <span class="text-sm font-medium text-gray-700">{{ user?.name || 'Admin' }}</span>
                <v-icon name="hi-chevron-down" class="w-4 h-4 text-gray-400" />
              </button>

              <!-- User Dropdown -->
              <div
                v-if="isUserMenuOpen"
                class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
              >
                <div class="py-2">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <div class="border-t border-gray-200 my-1"></div>
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        :class="[
          'bg-white shadow-sm border-r border-gray-200 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-64',
          'lg:block'
        ]"
      >
        <div class="h-full py-4">
          <nav class="space-y-1 px-3">
            <router-link
              to="/admin/dashboard"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-chart-bar" class="w-5 h-5 mr-3" />
              Dashboard
            </router-link>
            
            <router-link
              to="/admin/users"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-users" class="w-5 h-5 mr-3" />
              User Management
            </router-link>
            
            <router-link
              to="/admin/courses"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-academic-cap" class="w-5 h-5 mr-3" />
              Course Management
            </router-link>
            
            <router-link
              to="/admin/orders"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-shopping-bag" class="w-5 h-5 mr-3" />
              Orders
            </router-link>
            
            <router-link
              to="/admin/analytics"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-chart-pie" class="w-5 h-5 mr-3" />
              Analytics
            </router-link>
            
            <router-link
              to="/admin/settings"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              active-class="bg-gray-100 text-gray-900"
            >
              <v-icon name="hi-cog" class="w-5 h-5 mr-3" />
              Settings
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>
  </div>
</template>
