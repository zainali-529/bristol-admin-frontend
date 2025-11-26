import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchFAQs = createAsyncThunk(
  'faqs/fetchFAQs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getFAQs(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchFAQById = createAsyncThunk(
  'faqs/fetchFAQById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getFAQById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createFAQ = createAsyncThunk(
  'faqs/createFAQ',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await apiService.createFAQ(faqData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateFAQ = createAsyncThunk(
  'faqs/updateFAQ',
  async ({ id, faqData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateFAQ(id, faqData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteFAQ = createAsyncThunk(
  'faqs/deleteFAQ',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteFAQ(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateFAQStatus = createAsyncThunk(
  'faqs/updateFAQStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateFAQStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateFAQOrder = createAsyncThunk(
  'faqs/updateFAQOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateFAQOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchFAQStats = createAsyncThunk(
  'faqs/fetchFAQStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFAQStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchFAQCategories = createAsyncThunk(
  'faqs/fetchFAQCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getFAQCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const faqsSlice = createSlice({
  name: 'faqs',
  initialState: {
    faqs: [],
    selectedFAQ: null,
    categories: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalFAQs: 0,
      limit: 10,
    },
    filters: {
      status: '',
      category: '',
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
    setSelectedFAQ: (state, action) => {
      state.selectedFAQ = action.payload
    },
    clearSelectedFAQ: (state) => {
      state.selectedFAQ = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch FAQs
      .addCase(fetchFAQs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.faqs = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.currentPage || state.pagination.currentPage,
            totalPages: action.payload.totalPages || state.pagination.totalPages,
            totalFAQs: action.payload.total || state.pagination.totalFAQs,
          }
        }
      })
      .addCase(fetchFAQs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch FAQ By ID
      .addCase(fetchFAQById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFAQById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedFAQ = action.payload.data
      })
      .addCase(fetchFAQById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create FAQ
      .addCase(createFAQ.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createFAQ.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.faqs = [action.payload.data, ...state.faqs]
          state.pagination.totalFAQs = (state.pagination.totalFAQs || 0) + 1
        }
      })
      .addCase(createFAQ.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update FAQ
      .addCase(updateFAQ.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.loading = false
        const index = state.faqs.findIndex(f => f._id === action.payload.data._id)
        if (index !== -1) {
          state.faqs[index] = action.payload.data
        }
        if (state.selectedFAQ?._id === action.payload.data._id) {
          state.selectedFAQ = action.payload.data
        }
      })
      .addCase(updateFAQ.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete FAQ
      .addCase(deleteFAQ.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.loading = false
        state.faqs = state.faqs.filter(f => f._id !== action.payload)
      })
      .addCase(deleteFAQ.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update FAQ Status
      .addCase(updateFAQStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFAQStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.faqs.findIndex(f => f._id === action.payload.data._id)
        if (index !== -1) {
          state.faqs[index] = action.payload.data
        }
        if (state.selectedFAQ?._id === action.payload.data._id) {
          state.selectedFAQ = action.payload.data
        }
      })
      .addCase(updateFAQStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update FAQ Order
      .addCase(updateFAQOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFAQOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.faqs.findIndex(f => f._id === action.payload.data._id)
        if (index !== -1) {
          state.faqs[index] = action.payload.data
        }
        if (state.selectedFAQ?._id === action.payload.data._id) {
          state.selectedFAQ = action.payload.data
        }
      })
      .addCase(updateFAQOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch FAQ Stats
      .addCase(fetchFAQStats.pending, (state) => {
        state.stats = null
        state.error = null
      })
      .addCase(fetchFAQStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchFAQStats.rejected, (state, action) => {
        state.stats = null
        state.error = action.payload
      })
      // Fetch FAQ Categories
      .addCase(fetchFAQCategories.pending, (state) => {
        state.error = null
      })
      .addCase(fetchFAQCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || []
      })
      .addCase(fetchFAQCategories.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedFAQ, clearSelectedFAQ } = faqsSlice.actions
export default faqsSlice.reducer

