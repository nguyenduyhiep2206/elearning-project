<script setup>
import { ref } from 'vue'

const activeFilter = ref('All Recommendation')

const filters = [
  'All Recommendation',
  'Adobe Illustrator',
  'Adobe Photoshop',
  'UI Design',
  'Web Programming',
  'Mobile Programming',
  'Backend Development',
  'Vue JS'
]

const setActiveFilter = (filter) => {
  activeFilter.value = filter
}
</script>

<template>
  <section class="w-full bg-white py-8 px-4 md:px-8 border-b border-gray-200">
    <div class="max-w-7xl mx-auto">
      <div class="overflow-x-auto scrollbar-hide">
        <div class="flex gap-3 pb-2">
          <button
            v-for="filter in filters"
            :key="filter"
            @click="setActiveFilter(filter)"
            class="px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all"
            :class="
              activeFilter === filter
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
