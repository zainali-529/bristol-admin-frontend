import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getSuppliers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers')
    }
  }
)

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getSupplierById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier')
    }
  }
)

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.createSupplier(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier')
    }
  }
)

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSupplier(id, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier')
    }
  }
)

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteSupplier(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier')
    }
  }
)

export const updateSupplierStatus = createAsyncThunk(
  'suppliers/updateSupplierStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSupplierStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier status')
    }
  }
)

export const fetchSupplierStats = createAsyncThunk(
  'suppliers/fetchSupplierStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSupplierStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  suppliers: [],
  selectedSupplier: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalSuppliers: 0,
    limit: 5,
  },
  filters: {
    status: '',
    search: '',
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  },
  loading: false,
  error: null,
}

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPaginationLimit: (state, action) => {
      state.pagination.limit = action.payload
      state.pagination.currentPage = 1 // Reset to first page when limit changes
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers = action.payload.data || []
        state.pagination = {
          ...state.pagination,
          currentPage: action.payload.page || 1,
          totalPages: action.payload.pages || 1,
          totalSuppliers: action.payload.total || 0,
        }
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch supplier by ID
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSupplier = action.payload.data
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers.unshift(action.payload.data)
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false
        const updatedSupplier = action.payload.data
        const index = state.suppliers.findIndex((s) => s._id === updatedSupplier._id)
        if (index !== -1) {
          state.suppliers[index] = updatedSupplier
        }
        if (state.selectedSupplier?._id === updatedSupplier._id) {
          state.selectedSupplier = updatedSupplier
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers = state.suppliers.filter((s) => s._id !== action.payload)
        if (state.selectedSupplier?._id === action.payload) {
          state.selectedSupplier = null
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update supplier status
      .addCase(updateSupplierStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSupplierStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedSupplier = action.payload.data
        const index = state.suppliers.findIndex((s) => s._id === updatedSupplier._id)
        if (index !== -1) {
          state.suppliers[index] = updatedSupplier
        }
        if (state.selectedSupplier?._id === updatedSupplier._id) {
          state.selectedSupplier = updatedSupplier
        }
      })
      .addCase(updateSupplierStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch stats
      .addCase(fetchSupplierStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSupplierStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchSupplierStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, clearSelectedSupplier, clearError } = suppliersSlice.actions
export default suppliersSlice.reducer
