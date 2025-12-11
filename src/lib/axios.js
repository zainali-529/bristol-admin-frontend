import axios from 'axios'
import { store } from '@/store/store'
import { logout } from '@/store/authSlice'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state?.auth?.token || localStorage.getItem('authToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        try {
          localStorage.removeItem('authToken')
          localStorage.removeItem('token')
          store.dispatch(logout())
        } finally {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }
      return Promise.reject({
        status,
        message: data?.message || error.message || 'An error occurred',
        data: data || null,
      })
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

