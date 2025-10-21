<template>
    <div class="min-h-screen bg-gray-50">

        <!-- Main Content -->
        <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <!-- Login Form Container -->
                <div class="bg-white py-8 px-6 md:shadow-lg md:border md:border-gray-200 md:rounded-lg md:px-8">
                    <!-- Form Header -->
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-900 mb-2">
                            Đăng nhập
                        </h2>
                        <p class="text-gray-600 text-sm">
                            Nhập thông tin đăng nhập để truy cập tài khoản của bạn
                        </p>
                    </div>

                     <!-- Error Message -->
                     <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                         {{ errorMessage }}
                     </div>

                     <!-- Login Form -->
                     <form @submit.prevent="handleLogin" class="space-y-6">
                        <!-- Email Field -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                Email <span class="text-red-500">*</span>
                            </label>
                            <input id="email" v-model="email" type="email" placeholder="name@email.com"
                                class="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                required />
                        </div>

                        <!-- Password Field -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="Nhập mật khẩu"
                                    class="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                    required />
                                <button type="button" @click="togglePasswordVisibility"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <!-- Forgot Password Link -->
                            <div class="text-right mt-1">
                                <a href="#" class="text-sm text-blue-600 hover:text-blue-800">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                         <!-- Login Button -->
                         <button type="submit"
                             :disabled="isLoading"
                             class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                             <span v-if="isLoading">Đang đăng nhập...</span>
                             <span v-else>Đăng nhập</span>
                         </button>
                    </form>

                    <!-- Divider -->
                    <div class="relative my-8">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-gray-500">hoặc</span>
                        </div>
                    </div>

                    <!-- Social Login Buttons -->
                    <div class="space-y-3">
                        <!-- Google -->
                        <button
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <v-icon name="fc-google" class="w-5 h-5 mr-3" />
                            Tiếp tục với Google
                        </button>

                        <!-- Facebook -->
                        <button
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <v-icon name="fa-facebook" class="w-5 h-5 mr-3 text-blue-600" />
                            Tiếp tục với Facebook
                        </button>

                        <!-- Apple -->
                        <button
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <v-icon name="fa-apple" class="w-5 h-5 mr-3 text-black" />
                            Tiếp tục với Apple
                        </button>
                    </div>
                </div>

                <!-- Footer Links -->
                <div class="text-center space-y-2">
                    <p class="text-sm text-gray-600">
                        <a href="#" class="text-blue-600 hover:text-blue-800">Đăng ký thông qua tổ chức của bạn</a>
                    </p>
                    <div class="flex justify-center space-x-4 text-sm">
                        <a href="#" class="text-blue-600 hover:text-blue-800">Điều khoản sử dụng</a>
                        <a href="#" class="text-blue-600 hover:text-blue-800">Chính sách</a>
                        <a href="#" class="text-blue-600 hover:text-blue-800">Trợ giúp</a>
                    </div>
                    <p class="text-xs text-gray-500 mt-4">
                        Bằng cách đăng nhập, bạn đồng ý với
                        <a href="#" class="text-blue-600 hover:text-blue-800">Điều khoản dịch vụ</a>
                        và
                        <a href="#" class="text-blue-600 hover:text-blue-800">Chính sách bảo mật</a>
                        của chúng tôi.
                    </p>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Computed properties từ store
const errorMessage = computed(() => authStore.error)
const isLoading = computed(() => authStore.isLoading)

// Methods
const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const handleLogin = async () => {
    // Xóa lỗi trước đó
    authStore.clearError()
    
    // Gọi hàm login từ store
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
        // Đăng nhập thành công, chuyển hướng
        router.push('/Dashboard')
    }
    // Nếu thất bại, error sẽ được hiển thị thông qua computed errorMessage
}
</script>

<style scoped>
/* Custom styles if needed */
</style>