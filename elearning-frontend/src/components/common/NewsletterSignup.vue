<script setup>
import { ref } from 'vue'

const email = ref('')

const handleSubscribe = () => {
  if (email.value) {
    console.log('Subscribed with email:', email.value)
    email.value = ''
  }
}
</script>

<template>
  <section class="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-12 px-4 md:px-8 relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-0 right-0 opacity-20">
      <svg class="w-64 h-64 text-white" viewBox="0 0 200 200" fill="currentColor">
        <circle cx="50" cy="50" r="30" />
        <circle cx="150" cy="100" r="25" />
        <circle cx="100" cy="180" r="35" />
      </svg>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <!-- Content -->
        <div>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Join and get amazing discount
          </h2>
          <p class="text-blue-100 text-lg">
            With our responsive themes and mobile and desktop apps
          </p>
        </div>

        <!-- Form -->
        <div class="flex flex-col gap-3">
          <div class="flex flex-col md:flex-row gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              @click="handleSubscribe"
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
