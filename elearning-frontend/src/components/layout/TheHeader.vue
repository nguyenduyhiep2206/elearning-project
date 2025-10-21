<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const isBrowseMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// Sử dụng computed properties từ store
const user = computed(() => authStore.user)
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Khởi tạo auth state khi component mount
onMounted(() => {
  console.log('TheHeader mounted, initializing auth...')
  authStore.initializeAuth()
  console.log('Auth state after init:', {
    isLoggedIn: authStore.isLoggedIn,
    user: authStore.user
  })
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const toggleBrowseMenu = () => {
  isBrowseMenuOpen.value = !isBrowseMenuOpen.value
  isUserMenuOpen.value = false
  menuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isBrowseMenuOpen.value = false
  menuOpen.value = false
}

const closeAllMenus = () => {
  isBrowseMenuOpen.value = false
  isUserMenuOpen.value = false
  menuOpen.value = false
}

// Logout function
const handleLogout = async () => {
  // Close all menus
  closeAllMenus()
  
  // Gọi logout từ store
  await authStore.logout()
  
  // Redirect to home
  router.push('/')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left Section: Logo + Browse -->
        <div class="flex items-center gap-6">
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">m</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">MyCourse.io</h1>
          </div>

          <!-- Browse Dropdown -->
          <div class="relative">
            <button @click="toggleBrowseMenu"
              class="hidden md:flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-900">
              <span class="text-sm font-medium">Browse</span>
              <v-icon name="hi-chevron-down"
                :class="['w-4 h-4 transition-transform', isBrowseMenuOpen ? 'rotate-180' : '']" />
            </button>

            <!-- Browse Dropdown Menu -->
            <div v-if="isBrowseMenuOpen"
              class="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div class="p-6">
                <div class="grid grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Design</h3>
                        <p class="text-sm text-gray-500">All About Design Course</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Programming</h3>
                        <p class="text-sm text-gray-500">Website and Mobile Programming</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Business & Marketing</h3>
                        <p class="text-sm text-gray-500">Website and Mobile Programming</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Photo & Video</h3>
                        <p class="text-sm text-gray-500">Website and Mobile Programming</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Writing</h3>
                        <p class="text-sm text-gray-500">Website and Mobile Programming</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Illustration</h3>
                        <p class="text-sm text-gray-500">How to be great illustrator</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">Graphic Design</h3>
                        <p class="text-sm text-gray-500">Make more benefit from design</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                    <div class="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h3 class="font-semibold text-gray-900">UI/UX Design</h3>
                        <p class="text-sm text-gray-500">Make Design for website and apps</p>
                      </div>
                      <v-icon name="hi-chevron-down"
                        class="w-4 h-4 text-gray-400 group-hover:text-gray-600 rotate-[-90deg]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Section: Search Bar -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <div class="flex items-center bg-gray-100 rounded-lg px-4 py-2">
              <input type="text" placeholder="Search for course"
                class="bg-transparent outline-none text-gray-700 placeholder-gray-500 w-full" />
              <v-icon name="hi-search" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Right Section: Actions -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Become Instructor Link -->
          <a href="#" class="text-gray-700 hover:text-gray-900 text-sm font-medium">
            Become instructor
          </a>

          <!-- When NOT logged in -->
          <div v-if="!isLoggedIn" class="flex items-center gap-3">
            <!-- Login Button -->
            <router-link to="/login">
              <button
                class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Login
              </button>
            </router-link>

            <!-- Sign Up Button -->
            <router-link to="/signup">
              <button
                class="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center gap-2">
                <v-icon name="hi-clock" class="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </router-link>
          </div>

          <!-- When logged in -->
          <div v-else class="flex items-center gap-4">
            <!-- Shopping Cart -->
            <button class="relative p-2 text-gray-700 hover:text-gray-900">
              <v-icon name="hi-shopping-cart" class="w-6 h-6" />
              <span
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>

            <!-- Notification Bell -->
            <button class="relative p-2 text-gray-700 hover:text-gray-900">
              <v-icon name="hi-bell" class="w-6 h-6" />
              <span
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
            </button>

            <!-- User Avatar with Dropdown -->
            <div class="relative">
              <button @click="toggleUserMenu" class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100">
                <img
                  :src="user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'"
                  :alt="user?.name || 'User Avatar'"
                  class="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
              </button>

              <!-- User Dropdown Menu -->
              <div v-if="isUserMenuOpen"
                class="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <!-- User Info -->
                <div class="p-4 border-b border-gray-200">
                  <h3 class="font-semibold text-gray-900">{{ user?.name || 'Jonathan Doe' }}</h3>
                  <p class="text-sm text-gray-500">{{ user?.email || 'doe.jonathan@email.com' }}</p>
                </div>

                <!-- Menu Items -->
                <div class="py-2">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Courses</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Cart</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notifications</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                </div>

                <!-- Logout Button -->
                <div class="border-t border-gray-200 p-2">
                  <button @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMenu" class="md:hidden p-2 text-gray-700 hover:text-gray-900">
          <v-icon name="hi-menu" class="h-6 w-6" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="menuOpen" class="md:hidden border-t border-gray-200 py-4">
        <div class="space-y-4">
          <!-- Mobile Search -->
          <div class="flex items-center bg-gray-100 rounded-lg px-4 py-2">
            <v-icon name="hi-search" class="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search for course"
              class="bg-transparent ml-2 outline-none text-gray-700 placeholder-gray-500 w-full" />
          </div>

          <!-- Mobile Browse -->
          <div class="flex items-center gap-1 text-gray-600 py-2">
            <span class="text-sm font-medium">Browse</span>
            <v-icon name="hi-chevron-down" class="w-4 h-4" />
          </div>

          <!-- Mobile Actions -->
          <a href="#" class="block text-gray-700 hover:text-gray-900 text-sm font-medium py-2">
            Become instructor
          </a>

          <!-- Mobile Shopping Cart -->
          <div class="flex items-center justify-between py-2">
            <span class="text-gray-700 text-sm font-medium">Shopping Cart</span>
            <button class="relative p-2 text-gray-700 hover:text-gray-900">
              <v-icon name="hi-shopping-cart" class="w-6 h-6 text-gray-700" />
              <span
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <router-link to="/login" class="flex-1">
              <button
                class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                Login
              </button>
            </router-link>

            <router-link to="/signup" class="flex-1">
              <button class="w-full bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600">
                Sign Up
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for dropdowns -->
    <div v-if="isBrowseMenuOpen || isUserMenuOpen" @click="closeAllMenus" class="fixed inset-0 z-40"></div>
  </header>
</template>

<style scoped></style>
