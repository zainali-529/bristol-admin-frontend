import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Load initial state from localStorage
const savedToken = localStorage.getItem('authToken') || localStorage.getItem('token')
const savedUser = localStorage.getItem('user')

if (savedToken) {
  initialState.token = savedToken
  initialState.isAuthenticated = true
  if (savedUser) {
    try {
      initialState.user = JSON.parse(savedUser)
    } catch (e) {
      console.error('Error parsing saved user data:', e)
    }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    loginSuccess: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      
      // Save to localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('token', token)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setLoading, setError, loginSuccess, logout, clearError } = authSlice.actions
export default authSlice.reducer

