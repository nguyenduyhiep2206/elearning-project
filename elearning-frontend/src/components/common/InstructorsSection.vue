<script setup>
import InstructorCard from './InstructorCard.vue'

const instructors = [
  {
    id: 1,
    name: 'Alexander Beckton',
    specialty: 'Expert Mobile Engineer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop'
  },
  {
    id: 2,
    name: 'Labie Carithane',
    specialty: 'Marketing Specialist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop'
  },
  {
    id: 3,
    name: 'Jonathan Doe',
    specialty: 'Financial Strategist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop'
  },
  {
    id: 4,
    name: 'Kitani Sarsvati',
    specialty: 'Film Maker & Director',
    image: 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=160&h=160&fit=crop'
  }
]
</script>

<template>
  <section class="w-full bg-white py-12 px-4 md:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Popular Instructor
        </h2>
        <p class="text-gray-600">
          We know the best things for you. Top picks for You.
        </p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        <InstructorCard
          v-for="instructor in instructors"
          :key="instructor.id"
          :name="instructor.name"
          :specialty="instructor.specialty"
          :image="instructor.image"
        />
      </div>
    </div>
  </section>
</template>

<style scoped></style>
