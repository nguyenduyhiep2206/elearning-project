<script setup>
import { ref } from 'vue'

const currentSlide = ref(0)

const slides = [
  {
    headline: 'Learn something new everyday.',
    subheadline: 'Become professionals and ready to join the world.',
    cta: 'Explore Photography',
    bgColor: 'bg-teal-500',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&h=400&fit=crop'
  },
  {
    headline: 'Master Web Development',
    subheadline: 'Build stunning websites and applications with modern tools.',
    cta: 'Start Learning',
    bgColor: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop'
  },
  {
    headline: 'Design Your Future',
    subheadline: 'Create beautiful designs that users will love.',
    cta: 'Explore Design',
    bgColor: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=400&fit=crop'
  }
]

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}
</script>

<template>
  <section class="w-full bg-gray-50 py-8 px-4 md:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="relative overflow-hidden rounded-2xl h-80 md:h-96">
        <!-- Slides -->
        <div class="relative w-full h-full">
          <div
            v-for="(slide, index) in slides"
            :key="index"
            class="absolute inset-0 transition-opacity duration-700"
            :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
          >
            <div :class="[slide.bgColor, 'w-full h-full flex items-center justify-between p-8 md:p-12']">
              <!-- Content -->
              <div class="w-full md:w-1/2 text-white z-10">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {{ slide.headline }}
                </h2>
                <p class="text-base md:text-lg mb-8 opacity-90">
                  {{ slide.subheadline }}
                </p>
                <button class="px-6 py-3 bg-white text-teal-500 rounded-full font-bold hover:bg-gray-100 transition">
                  {{ slide.cta }}
                </button>
              </div>

              <!-- Image -->
              <div class="hidden md:block w-1/2 h-full relative">
                <img :src="slide.image" :alt="slide.headline" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          @click="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition"
        >
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition"
        >
          <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Slide Indicators -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          <button
            v-for="(slide, index) in slides"
            :key="index"
            @click="goToSlide(index)"
            class="w-2 h-2 rounded-full transition"
            :class="{ 'bg-white': currentSlide === index, 'bg-white/50': currentSlide !== index }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
