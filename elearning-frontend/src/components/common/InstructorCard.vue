<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="text-center">
    <!-- Circular Avatar -->
    <div class="mb-4 relative">
      <img
        :src="image"
        :alt="name"
        class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto shadow-lg"
      />
    </div>

    <!-- Name -->
    <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-1">
      {{ name }}
    </h3>

    <!-- Specialty -->
    <p class="text-gray-600 text-sm md:text-base">
      {{ specialty }}
    </p>
  </div>
</template>

<style scoped></style>
