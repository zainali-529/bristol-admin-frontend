import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getServices(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getServiceById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await apiService.createService(serviceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateService(id, serviceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteService(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateServiceStatus = createAsyncThunk(
  'services/updateServiceStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateServiceStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateServiceOrder = createAsyncThunk(
  'services/updateServiceOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateServiceOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchServiceStats = createAsyncThunk(
  'services/fetchServiceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getServiceStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    selectedService: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalServices: 0,
      limit: 10,
    },
    filters: {
      status: '', // 'active' or 'inactive'
      featured: '', // 'true' or 'false'
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
    setSelectedService: (state, action) => {
      state.selectedService = action.payload
    },
    clearSelectedService: (state) => {
      state.selectedService = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
        .addCase(fetchServices.pending, (state) => {
        state.loading = true
        state.error = null
        // Don't clear services array - keep existing data while loading
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false
        // Only update if we have data
        if (action.payload?.data) {
          state.services = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.currentPage || state.pagination.currentPage,
            totalPages: action.payload.totalPages || state.pagination.totalPages,
            totalServices: action.payload.total || state.pagination.totalServices,
          }
        }
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Don't clear services on error - keep existing data
      })
      // Fetch Service By ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedService = action.payload.data
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Service
      .addCase(createService.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false
        // Add new service to the beginning of the list if it exists
        if (action.payload?.data) {
          state.services = [action.payload.data, ...state.services]
          state.pagination.totalServices = (state.pagination.totalServices || 0) + 1
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false
        // Update service in list if it exists
        const index = state.services.findIndex(s => s._id === action.payload.data._id)
        if (index !== -1) {
          state.services[index] = action.payload.data
        }
        // Update selected service
        if (state.selectedService?._id === action.payload.data._id) {
          state.selectedService = action.payload.data
        }
        // Don't clear services array - keep existing data
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false
        state.services = state.services.filter(s => s._id !== action.payload)
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Service Status
      .addCase(updateServiceStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateServiceStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.services.findIndex(s => s._id === action.payload.data._id)
        if (index !== -1) {
          state.services[index] = action.payload.data
        }
        if (state.selectedService?._id === action.payload.data._id) {
          state.selectedService = action.payload.data
        }
      })
      .addCase(updateServiceStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Service Order
      .addCase(updateServiceOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateServiceOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.services.findIndex(s => s._id === action.payload.data._id)
        if (index !== -1) {
          state.services[index] = action.payload.data
        }
        if (state.selectedService?._id === action.payload.data._id) {
          state.selectedService = action.payload.data
        }
      })
      .addCase(updateServiceOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Service Stats
      .addCase(fetchServiceStats.pending, (state) => {
        state.stats = null
        state.error = null
      })
      .addCase(fetchServiceStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchServiceStats.rejected, (state, action) => {
        state.stats = null
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedService, clearSelectedService } = servicesSlice.actions
export default servicesSlice.reducer
