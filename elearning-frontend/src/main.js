import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import icons một cách an toàn
import { OhVueIcon, addIcons } from "oh-vue-icons"

// Import chỉ những icon cần thiết
import { 
  HiShoppingCart,
  HiSearch,
  HiMenu,
  HiChevronDown,
  HiBell,
  HiClock
} from "oh-vue-icons/icons/hi"

import { 
  FaGoogle,
  FaFacebook,
  FaApple
} from "oh-vue-icons/icons/fa"

import { FcGoogle } from "oh-vue-icons/icons/fc"

// Đăng ký các icon
addIcons(
  HiShoppingCart,
  HiSearch,
  HiMenu,
  HiChevronDown,
  HiBell,
  HiClock,
  FaGoogle,
  FaFacebook,
  FaApple,
  FcGoogle
)

const app = createApp(App)
const pinia = createPinia()

// Đăng ký component v-icon
app.component("v-icon", OhVueIcon)

app.use(pinia) // Sử dụng Pinia store
app.use(router) // Sử dụng router

app.mount('#app')

