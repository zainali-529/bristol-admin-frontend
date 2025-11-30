import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks
export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuotes(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotes')
    }
  }
)

export const fetchQuoteById = createAsyncThunk(
  'quotes/fetchQuoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuoteById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quote')
    }
  }
)

export const updateQuote = createAsyncThunk(
  'quotes/updateQuote',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateQuote(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quote')
    }
  }
)

export const updateQuoteStatus = createAsyncThunk(
  'quotes/updateQuoteStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateQuoteStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quote status')
    }
  }
)

export const deleteQuote = createAsyncThunk(
  'quotes/deleteQuote',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteQuote(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quote')
    }
  }
)

export const fetchQuoteStats = createAsyncThunk(
  'quotes/fetchQuoteStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getQuoteStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  quotes: [],
  selectedQuote: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalQuotes: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  },
  filters: {
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
}

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPaginationLimit: (state, action) => {
      state.pagination.limit = action.payload
      state.pagination.currentPage = 1 // Reset to first page when limit changes
    },
    clearSelectedQuote: (state) => {
      state.selectedQuote = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotes
      .addCase(fetchQuotes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.loading = false
        state.quotes = action.payload.data || []
        state.pagination = { ...state.pagination, ...action.payload.pagination }
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch quote by ID
      .addCase(fetchQuoteById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedQuote = action.payload.data
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update quote
      .addCase(updateQuote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        state.loading = false
        const updatedQuote = action.payload.data
        const index = state.quotes.findIndex((q) => q._id === updatedQuote._id)
        if (index !== -1) {
          state.quotes[index] = updatedQuote
        }
        if (state.selectedQuote?._id === updatedQuote._id) {
          state.selectedQuote = updatedQuote
        }
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update quote status
      .addCase(updateQuoteStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateQuoteStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedQuote = action.payload.data
        const index = state.quotes.findIndex((q) => q._id === updatedQuote._id)
        if (index !== -1) {
          state.quotes[index] = updatedQuote
        }
        if (state.selectedQuote?._id === updatedQuote._id) {
          state.selectedQuote = updatedQuote
        }
      })
      .addCase(updateQuoteStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete quote
      .addCase(deleteQuote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.loading = false
        state.quotes = state.quotes.filter((q) => q._id !== action.payload)
        if (state.selectedQuote?._id === action.payload) {
          state.selectedQuote = null
        }
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch stats
      .addCase(fetchQuoteStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchQuoteStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchQuoteStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, clearSelectedQuote, clearError } = quotesSlice.actions
export default quotesSlice.reducer

