<template>
    <!-- Modal Overlay -->
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click="handleOverlayClick">
        <!-- Modal Content -->
        <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-md mx-4 relative" @click.stop>
            <!-- Close Button -->
            <button @click="closeModal"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
            </button>

            <!-- Modal Body -->
            <div class="p-8">
                <!-- Title -->
                <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
                    Chào mừng quay trở lại
                </h2>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <!-- Email Field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Email <span class="text-red-500">*</span>
                        </label>
                        <input v-model="email" type="email" placeholder="name@email.com"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required />
                    </div>

                    <!-- Password Field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Nhập mật khẩu"
                                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium">
                        Đăng nhập
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative my-6">
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
                        class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Tiếp tục với Google
                    </button>

                    <!-- Facebook -->
                    <button
                        class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                            <path
                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Tiếp tục với Facebook
                    </button>

                    <!-- Apple -->
                    <button
                        class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-5 h-5 mr-2" fill="#000000" viewBox="0 0 24 24">
                            <path
                                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        Tiếp tục với Apple
                    </button>
                </div>

                <!-- Footer Links -->
                <div class="mt-6 text-center space-y-2">
                    <p class="text-sm text-gray-600">
                        Bạn chưa là thành viên Coursera?
                        <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Đăng ký</a>
                    </p>
                    <p class="text-sm text-gray-600">
                        <a href="#" class="text-blue-600 hover:text-blue-800">Đăng nhập với tổ chức của bạn</a>
                    </p>
                </div>

                <!-- Terms and Privacy -->
                <div class="mt-4 text-center">
                    <p class="text-xs text-gray-400">
                        Bằng cách đăng nhập, bạn đồng ý với
                        <a href="#" class="text-blue-600 hover:text-blue-800">Điều khoản dịch vụ</a>
                        và
                        <a href="#" class="text-blue-600 hover:text-blue-800">Chính sách bảo mật</a>
                        của chúng tôi. Trang này được bảo vệ bởi reCAPTCHA.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['close'])

// Reactive data
const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Methods
const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

const closeModal = () => {
    emit('close')
}

const handleOverlayClick = () => {
    closeModal()
}

const handleLogin = () => {
    // Handle login logic here
    console.log('Login attempt:', { email: email.value, password: password.value })
    // You can emit a login event or call an API here
}
</script>
