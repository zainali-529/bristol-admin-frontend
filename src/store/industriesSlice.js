import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchIndustries = createAsyncThunk(
  'industries/fetchIndustries',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getIndustries(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchIndustryById = createAsyncThunk(
  'industries/fetchIndustryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getIndustryById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createIndustry = createAsyncThunk(
  'industries/createIndustry',
  async (industryData, { rejectWithValue }) => {
    try {
      const response = await apiService.createIndustry(industryData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateIndustry = createAsyncThunk(
  'industries/updateIndustry',
  async ({ id, industryData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateIndustry(id, industryData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteIndustry = createAsyncThunk(
  'industries/deleteIndustry',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteIndustry(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateIndustryStatus = createAsyncThunk(
  'industries/updateIndustryStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateIndustryStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateIndustryOrder = createAsyncThunk(
  'industries/updateIndustryOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateIndustryOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const industriesSlice = createSlice({
  name: 'industries',
  initialState: {
    industries: [],
    selectedIndustry: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalIndustries: 0,
      limit: 10,
    },
    filters: {
      status: '', // 'active' or 'inactive'
      search: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    },
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
    setSelectedIndustry: (state, action) => {
      state.selectedIndustry = action.payload
    },
    clearSelectedIndustry: (state) => {
      state.selectedIndustry = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Industries
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.industries = action.payload.data
          state.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalIndustries: action.payload.total || 0,
            limit: state.pagination.limit,
          }
        }
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Industry By ID
      .addCase(fetchIndustryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIndustryById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedIndustry = action.payload.data
      })
      .addCase(fetchIndustryById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Industry
      .addCase(createIndustry.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createIndustry.fulfilled, (state, action) => {
        state.loading = false
        state.industries.unshift(action.payload.data)
        state.pagination.totalIndustries += 1
      })
      .addCase(createIndustry.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Industry
      .addCase(updateIndustry.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateIndustry.fulfilled, (state, action) => {
        state.loading = false
        const index = state.industries.findIndex(
          (industry) => industry._id === action.payload.data._id
        )
        if (index !== -1) {
          state.industries[index] = action.payload.data
        }
        if (state.selectedIndustry?._id === action.payload.data._id) {
          state.selectedIndustry = action.payload.data
        }
      })
      .addCase(updateIndustry.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Industry
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteIndustry.fulfilled, (state, action) => {
        state.loading = false
        state.industries = state.industries.filter(
          (industry) => industry._id !== action.payload
        )
        state.pagination.totalIndustries -= 1
        if (state.selectedIndustry?._id === action.payload) {
          state.selectedIndustry = null
        }
      })
      .addCase(deleteIndustry.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Industry Status
      .addCase(updateIndustryStatus.fulfilled, (state, action) => {
        const index = state.industries.findIndex(
          (industry) => industry._id === action.payload.data._id
        )
        if (index !== -1) {
          state.industries[index] = action.payload.data
        }
      })
      // Update Industry Order
      .addCase(updateIndustryOrder.fulfilled, (state, action) => {
        const index = state.industries.findIndex(
          (industry) => industry._id === action.payload.data._id
        )
        if (index !== -1) {
          state.industries[index] = action.payload.data
        }
      })
  },
})

export const {
  setFilters,
  setPaginationLimit,
  setSelectedIndustry,
  clearSelectedIndustry,
  clearError,
} = industriesSlice.actions

export default industriesSlice.reducer

