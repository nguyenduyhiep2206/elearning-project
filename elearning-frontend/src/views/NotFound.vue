<script setup>
import { useRouter } from 'vue-router'
import AppButton from '../components/common/AppButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <!-- 404 Icon -->
        <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <v-icon name="hi-exclamation-triangle" class="w-12 h-12 text-red-600" />
        </div>
        
        <!-- Error Message -->
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <AppButton
            variant="primary"
            @click="goHome"
            class="w-full sm:w-auto"
          >
            <v-icon name="hi-home" class="w-4 h-4 mr-2" />
            Go Home
          </AppButton>
          
          <AppButton
            variant="outline"
            @click="goBack"
            class="w-full sm:w-auto"
          >
            <v-icon name="hi-arrow-left" class="w-4 h-4 mr-2" />
            Go Back
          </AppButton>
        </div>
        
        <!-- Help Text -->
        <div class="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="/contact" class="text-teal-600 hover:text-teal-500">Contact our support team</a></p>
        </div>
      </div>
    </div>
  </div>
</template>
