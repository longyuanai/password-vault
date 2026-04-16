import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
import router from '@/router/index.js'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor — inject session token
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.sessionToken) {
      config.headers['x-session-token'] = authStore.sessionToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401, normalize errors
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 — redirect to unlock
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearSession()
      router.push({ name: 'Unlock' })
    }

    // Normalize error response
    const normalizedError = {
      success: false,
      error: {
        code: error.response?.data?.error?.code || 'NETWORK_ERROR',
        message: error.response?.data?.error?.message || error.message || '网络异常，请稍后重试'
      }
    }

    return Promise.reject(normalizedError)
  }
)

export default request
