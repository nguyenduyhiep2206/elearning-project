<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Test Page</h1>
      <p class="text-gray-600 mb-6">Nếu bạn thấy trang này, Vue Router đang hoạt động!</p>
      <div class="space-y-4">
        <router-link to="/" class="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Về trang chủ
        </router-link>
        <router-link to="/login" class="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Đi đến Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('TestPage mounted successfully')
})
</script>
