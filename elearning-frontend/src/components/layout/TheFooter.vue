<script setup></script>

<template>
  <footer class="w-full bg-gray-900 text-gray-300">
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <!-- Logo -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-xs">M</span>
            </div>
            <span class="font-bold text-lg text-white">MyCourse.io</span>
          </div>
          <p class="text-sm text-gray-400">Learn something new every day.</p>
        </div>

        <!-- Links Column 1 -->
        <div>
          <h4 class="font-bold text-white mb-4">Programming</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-teal-400 transition">Web Programming</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Mobile Programming</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Java Beginner</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">PHP Beginner</a></li>
          </ul>
        </div>

        <!-- Links Column 2 -->
        <div>
          <h4 class="font-bold text-white mb-4">Design</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-teal-400 transition">Adobe Illustrator</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Adobe Photoshop</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Design Logo</a></li>
          </ul>
        </div>

        <!-- Links Column 3 -->
        <div>
          <h4 class="font-bold text-white mb-4">Other</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-teal-400 transition">Writing Course</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Photography</a></li>
            <li><a href="#" class="hover:text-teal-400 transition">Video Making</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
        <p class="text-gray-400 text-sm mb-4 md:mb-0">
          © MyCourses 2024, All Rights Reserved
        </p>

        <!-- Social Links -->
        <div class="flex gap-4">
          <a href="https://twitter.com" target="_blank" class="hover:text-white">
          <v-icon name="fa-twitter" scale="1.5" />
        </a>
        <a href="https://instagram.com" target="_blank" class="hover:text-white">
          <v-icon name="fa-instagram" scale="1.5" />
        </a>
        <a href="https://facebook.com" target="_blank" class="hover:text-white">
          <v-icon name="fa-facebook" scale="1.5" />
        </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
