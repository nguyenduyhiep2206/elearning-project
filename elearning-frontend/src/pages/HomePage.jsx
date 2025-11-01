import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // State cho carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All Recommendation');

  // Dữ liệu carousel slides
  const slides = [
    {
      headline: 'Learn something new everyday.',
      subheadline: 'Become professionals and ready to join the world.',
      cta: 'Explore Photography',
      bgColor: 'bg-teal-500',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&h=400&fit=crop',
      instructor: {
        name: 'Jessica Wang | Photographer',
        award: 'Winner Photo 2017 Awards | Joined Klevr since 2006'
      }
    },
    {
      headline: 'Master Web Development',
      subheadline: 'Build stunning websites and applications with modern tools.',
      cta: 'Start Learning',
      bgColor: 'bg-purple-500',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop',
      instructor: {
        name: 'John Smith | Developer',
        award: 'Senior Full Stack Developer | 10+ years experience'
      }
    },
    {
      headline: 'Design Your Future',
      subheadline: 'Create beautiful designs that users will love.',
      cta: 'Explore Design',
      bgColor: 'bg-blue-500',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=400&fit=crop',
      instructor: {
        name: 'Sarah Johnson | Designer',
        award: 'Award-winning UI/UX Designer | Creative Director'
      }
    }
  ];

  // Dữ liệu filters
  const filters = [
    'All Recommendation',
    'Adobe Illustrator',
    'Adobe Photoshop',
    'UI Design',
    'Web Programming',
    'Mobile Programming',
    'Backend Development',
    'Vue JS'
  ];

  // Dữ liệu khóa học
  const courses = [
    {
      id: 1,
      title: 'VUE JAVASCRIPT COURSE',
      instructor: 'Kitani Studio',
      price: '$24.92',
      originalPrice: '$32.90',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face',
      tag: 'Best Seller',
      rating: 5,
      reviews: 1200
    },
    {
      id: 2,
      title: 'UI DESIGN FOR BEGINNERS',
      instructor: 'Kitani Studio',
      price: '$19.99',
      originalPrice: '$29.99',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face',
      tag: 'Best Seller',
      rating: 5,
      reviews: 856
    },
    {
      id: 3,
      title: 'MOBILE DEV REACT NATIVE',
      instructor: 'Kitani Studio',
      price: '$34.50',
      originalPrice: '$45.00',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face',
      tag: 'Best Seller',
      rating: 5,
      reviews: 934
    },
    {
      id: 4,
      title: 'WEBSITE DEV ZERO TO HERO',
      instructor: 'Kitani Studio',
      price: '$28.75',
      originalPrice: '$39.99',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=200&fit=crop&crop=face',
      tag: 'Best Seller',
      rating: 5,
      reviews: 1100
    }
  ];

  const trendingCourses = [
    {
      id: 5,
      title: 'DEVELOPMENT BOOTCAMP',
      instructor: 'Tech Academy',
      price: '$199.99',
      originalPrice: '$299.99',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=face',
      tag: '20% OFF',
      rating: 5,
      reviews: 856
    },
    {
      id: 6,
      title: 'IOS 13 SWIFT 5 IOS DEVELOPMEN',
      instructor: 'Apple Dev',
      price: '$89.99',
      originalPrice: '$129.99',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=200&fit=crop&crop=face',
      tag: '20% OFF',
      rating: 5,
      reviews: 623
    },
    {
      id: 7,
      title: 'LEARN PROGRAMI IN 30 DAYS',
      instructor: 'Code Master',
      price: '$49.99',
      originalPrice: '$79.99',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=200&fit=crop&crop=face',
      tag: '20% OFF',
      rating: 5,
      reviews: 445
    },
    {
      id: 8,
      title: 'MAKE UBER CLONE APP',
      instructor: 'App Builder',
      price: '$149.99',
      originalPrice: '$199.99',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=200&fit=crop&crop=face',
      tag: '20% OFF',
      rating: 5,
      reviews: 789
    }
  ];

  const instructors = [
    {
      id: 1,
      name: 'Alexander Bastian',
      profession: 'Expert Mobile Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Labie Carthaline',
      profession: 'UI/UX Designer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Jonathan Doe',
      profession: 'Full Stack Developer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Kitani Sarasvati',
      profession: 'Data Scientist',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop&crop=face'
    }
  ];

  // Functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[450px] rounded-2xl overflow-hidden max-w-7xl mx-auto shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-between p-10 transition-opacity duration-700 ${slide.bgColor} ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex-1 text-white z-10">
              <h1 className="text-5xl font-bold mb-5 leading-tight">
                {slide.headline}
              </h1>
              <p className="text-lg mb-8 opacity-90">
                {slide.subheadline}
              </p>
              <button className="px-8 py-4 bg-white text-teal-500 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300">
                {slide.cta}
              </button>
            </div>
            <div className="flex-1 h-full relative flex items-end p-10">
              <img 
                src={slide.image} 
                alt={slide.headline} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="bg-black bg-opacity-70 p-5 rounded-lg text-white z-10">
                <div className="text-lg font-bold mb-1">{slide.instructor.name}</div>
                <div className="text-sm opacity-80">{slide.instructor.award}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-white rounded-full p-2 transition-all duration-300"
        >
          <i className="fas fa-chevron-left text-gray-800 text-lg"></i>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-white rounded-full p-2 transition-all duration-300"
        >
          <i className="fas fa-chevron-right text-gray-800 text-lg"></i>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
              }`  }
            />
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="py-10 px-5 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex gap-4 justify-center flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* More from Kitani Studio Section */}
      <div className="py-15 px-5 max-w-6xl mx-auto mt-4">
        <h2 className="text-4xl font-bold mb-3 text-gray-900">More from Kitani Studio</h2>
        <p className="text-gray-600 mb-10">We know the best things for You. Top picks for You.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">
                  {course.tag}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 mb-2">by {course.instructor}</p>
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <span className="text-gray-600 text-sm">({course.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{course.price}</span>
                  <span className="text-gray-500 line-through">{course.originalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Course Section */}
      <div className="py-15 px-5 max-w-6xl mx-auto mt-4">
        <h2 className="text-4xl font-bold mb-3 text-gray-900">Trending Course</h2>
        <p className="text-gray-600 mb-10">We know the best things for You. Top picks for You.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">
                  {course.tag}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 mb-2">by {course.instructor}</p>
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex text-yellow-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <span className="text-gray-600 text-sm">({course.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{course.price}</span>
                  <span className="text-gray-500 line-through">{course.originalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Instructor Section */}
      <div className="py-15 px-5 max-w-6xl mx-auto mt-4">
        <h2 className="text-4xl font-bold mb-3 text-gray-900">Popular Instructor</h2>
        <p className="text-gray-600 mb-10">We know the best things for You. Top picks for You.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <img src={instructor.image} alt={instructor.name} className="w-full h-48 object-cover" />
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold mb-1 text-gray-900">{instructor.name}</h3>
                <p className="text-gray-600">{instructor.profession}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 py-20 px-5 text-center text-white relative overflow-hidden mt-4">
        <div className="absolute right-0 top-0 w-80 h-full opacity-30" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
             }}>
        </div>
        <h2 className="text-4xl font-bold mb-5">Join and get amazing discount.</h2>
        <p className="text-lg mb-10 opacity-90">
          With our responsive themes and mobile and desktop apps.
        </p>
        <div className="flex justify-center gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="flex-1 px-5 py-4 rounded-full border-none text-gray-900 outline-none"
          />
          <button className="px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-all duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
