import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchEnergyPrices = createAsyncThunk(
  'energyPrices/fetchEnergyPrices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getEnergyPrices(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchEnergyPriceById = createAsyncThunk(
  'energyPrices/fetchEnergyPriceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getEnergyPriceById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchCurrentEnergyPrice = createAsyncThunk(
  'energyPrices/fetchCurrentEnergyPrice',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCurrentEnergyPrice()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createOrUpdateEnergyPrice = createAsyncThunk(
  'energyPrices/createOrUpdateEnergyPrice',
  async (priceData, { rejectWithValue }) => {
    try {
      const response = await apiService.createOrUpdateEnergyPrice(priceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateMarketInsights = createAsyncThunk(
  'energyPrices/updateMarketInsights',
  async (insightsData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateMarketInsights(insightsData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteEnergyPrice = createAsyncThunk(
  'energyPrices/deleteEnergyPrice',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteEnergyPrice(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const energyPricesSlice = createSlice({
  name: 'energyPrices',
  initialState: {
    prices: [],
    currentPrice: null,
    selectedPrice: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPrices: 0,
      limit: 5,
    },
    filters: {
      isActive: '',
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
    setSelectedPrice: (state, action) => {
      state.selectedPrice = action.payload
    },
    clearSelectedPrice: (state) => {
      state.selectedPrice = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Energy Prices
      .addCase(fetchEnergyPrices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEnergyPrices.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.prices = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.pagination?.currentPage || state.pagination.currentPage,
            totalPages: action.payload.pagination?.totalPages || state.pagination.totalPages,
            totalPrices: action.payload.pagination?.totalItems || state.pagination.totalPrices,
          }
        }
      })
      .addCase(fetchEnergyPrices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Current Energy Price
      .addCase(fetchCurrentEnergyPrice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCurrentEnergyPrice.fulfilled, (state, action) => {
        state.loading = false
        state.currentPrice = action.payload?.data || action.payload
      })
      .addCase(fetchCurrentEnergyPrice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Energy Price By ID
      .addCase(fetchEnergyPriceById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEnergyPriceById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedPrice = action.payload?.data || action.payload
      })
      .addCase(fetchEnergyPriceById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create or Update Energy Price
      .addCase(createOrUpdateEnergyPrice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrUpdateEnergyPrice.fulfilled, (state, action) => {
        state.loading = false
        const updatedPrice = action.payload?.data || action.payload
        // Update current price if it's the active one
        if (updatedPrice.isActive) {
          state.currentPrice = updatedPrice
        }
        // Update in list if exists
        const index = state.prices.findIndex(p => p._id === updatedPrice._id)
        if (index !== -1) {
          state.prices[index] = updatedPrice
        } else {
          state.prices = [updatedPrice, ...state.prices]
        }
      })
      .addCase(createOrUpdateEnergyPrice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Market Insights
      .addCase(updateMarketInsights.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMarketInsights.fulfilled, (state, action) => {
        state.loading = false
        // Update insights in current price
        if (state.currentPrice) {
          state.currentPrice.insights = action.payload?.data || action.payload
        }
      })
      .addCase(updateMarketInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Energy Price
      .addCase(deleteEnergyPrice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEnergyPrice.fulfilled, (state, action) => {
        state.loading = false
        state.prices = state.prices.filter(p => p._id !== action.payload)
      })
      .addCase(deleteEnergyPrice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedPrice, clearSelectedPrice } = energyPricesSlice.actions
export default energyPricesSlice.reducer

