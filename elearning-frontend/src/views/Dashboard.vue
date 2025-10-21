<script setup>
import HeroSection from '../components/common/HeroSection.vue'
import CourseFilters from '../components/common/CourseFilters.vue'
import CourseList from '../components/common/CourseList.vue'
import InstructorsSection from '../components/common/InstructorsSection.vue'
import NewsletterSignup from '../components/common/NewsletterSignup.vue'
</script>
<template>
    <HeroSection />
    <CourseFilters />
    <CourseList title="More from Kitani Studio" subtitle="We know the best things for you. Top picks for You." />
    <CourseList title="Trending Course" subtitle="We know the best things for you. Top picks for You." />
    <InstructorsSection />
    <NewsletterSignup />
</template>
