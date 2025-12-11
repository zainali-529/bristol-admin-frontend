import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetchTestimonials',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getAdminTestimonials(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchTestimonialById = createAsyncThunk(
  'testimonials/fetchTestimonialById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getAdminTestimonialById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createTestimonial = createAsyncThunk(
  'testimonials/createTestimonial',
  async (testimonialData, { rejectWithValue }) => {
    try {
      const response = await apiService.createTestimonial(testimonialData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTestimonial = createAsyncThunk(
  'testimonials/updateTestimonial',
  async ({ id, testimonialData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTestimonial(id, testimonialData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteTestimonial = createAsyncThunk(
  'testimonials/deleteTestimonial',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteTestimonial(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTestimonialStatus = createAsyncThunk(
  'testimonials/updateTestimonialStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTestimonialStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTestimonialOrder = createAsyncThunk(
  'testimonials/updateTestimonialOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTestimonialOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchTestimonialStats = createAsyncThunk(
  'testimonials/fetchTestimonialStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTestimonialStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState: {
    testimonials: [],
    selectedTestimonial: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalTestimonials: 0,
      limit: 5,
    },
    filters: {
      status: '', // 'active' or 'inactive'
      search: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    },
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPaginationLimit: (state, action) => {
      state.pagination.limit = action.payload
    },
    setSelectedTestimonial: (state, action) => {
      state.selectedTestimonial = action.payload
    },
    clearSelectedTestimonial: (state) => {
      state.selectedTestimonial = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Testimonials
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.testimonials = action.payload.data
          state.pagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalTestimonials: action.payload.total,
            limit: state.pagination.limit,
          }
        }
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Testimonial By ID
      .addCase(fetchTestimonialById.pending, (state) => {
        state.loading = true
        state.error = null
        state.selectedTestimonial = null
      })
      .addCase(fetchTestimonialById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedTestimonial = action.payload.data
      })
      .addCase(fetchTestimonialById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Testimonial
      .addCase(createTestimonial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTestimonial.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createTestimonial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Testimonial
      .addCase(updateTestimonial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTestimonial.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Testimonial
      .addCase(deleteTestimonial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.loading = false
        state.testimonials = state.testimonials.filter(
          (testimonial) => testimonial._id !== action.payload
        )
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Testimonial Status
      .addCase(updateTestimonialStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTestimonialStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedTestimonial = action.payload.data
        state.testimonials = state.testimonials.map((testimonial) =>
          testimonial._id === updatedTestimonial._id ? updatedTestimonial : testimonial
        )
      })
      .addCase(updateTestimonialStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Testimonial Order
      .addCase(updateTestimonialOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTestimonialOrder.fulfilled, (state, action) => {
        state.loading = false
        const updatedTestimonial = action.payload.data
        state.testimonials = state.testimonials.map((testimonial) =>
          testimonial._id === updatedTestimonial._id ? updatedTestimonial : testimonial
        )
        state.testimonials.sort((a, b) => a.displayOrder - b.displayOrder)
      })
      .addCase(updateTestimonialOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Testimonial Stats
      .addCase(fetchTestimonialStats.pending, (state) => {
        state.stats = null
      })
      .addCase(fetchTestimonialStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchTestimonialStats.rejected, (state) => {
        state.stats = { total: 0, active: 0, inactive: 0 }
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedTestimonial, clearSelectedTestimonial } = testimonialsSlice.actions
export default testimonialsSlice.reducer

