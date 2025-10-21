<script setup>
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <TheHeader />
    <main class="flex-grow">
      <router-view></router-view>
    </main>
    <TheFooter />

  </div>
</template>

<style scoped></style>
