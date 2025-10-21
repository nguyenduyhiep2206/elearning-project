<script setup>
import CourseCard from './CourseCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  courseType: {
    type: String,
    default: 'latest', // 'popular', 'latest', 'all'
    validator: (value) => ['popular', 'latest', 'all'].includes(value)
  },
  limit: {
    type: Number,
    default: 8
  }
})

// Hàm xử lý khi click vào card khóa học
const handleCourseClick = (course) => {
  const courseId = course.courseid || course.id
  if (courseId) {
    router.push(`/courses/${courseId}`)
  }
}
</script>

<template>
  <section class="w-full bg-white py-12 px-4 md:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-gray-600">
          {{ subtitle }}
        </p>
      </div>

      <!-- Course Cards -->
      <CourseCard :course-type="courseType" :limit="limit" @course-click="handleCourseClick" />
    </div>
  </section>
</template>

<style scoped></style>
