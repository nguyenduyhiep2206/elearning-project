<script setup>
import TheHeader from '../components/layout/TheHeader.vue'
import TheFooter from '../components/layout/TheFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <TheHeader />
    
    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- Footer -->
    <TheFooter />
  </div>
</template>
