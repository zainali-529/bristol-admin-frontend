import { createSlice } from '@reduxjs/toolkit'

const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token') || null

const initialState = {
  user: null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
}

// No persistence; start fresh every load

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
      if (token) {
        localStorage.setItem('authToken', token)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setLoading, setError, loginSuccess, logout, clearError } = authSlice.actions
export default authSlice.reducer

