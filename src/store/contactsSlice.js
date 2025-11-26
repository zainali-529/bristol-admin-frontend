import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getContacts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contacts')
    }
  }
)

export const fetchContactById = createAsyncThunk(
  'contacts/fetchContactById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getContactById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch contact')
    }
  }
)

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateContact(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact')
    }
  }
)

export const updateContactStatus = createAsyncThunk(
  'contacts/updateContactStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateContactStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update contact status')
    }
  }
)

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteContact(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete contact')
    }
  }
)

export const fetchContactStats = createAsyncThunk(
  'contacts/fetchContactStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getContactStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  contacts: [],
  selectedContact: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalContacts: 0,
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

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPaginationLimit: (state, action) => {
      state.pagination.limit = action.payload
      state.pagination.currentPage = 1 // Reset to first page when limit changes
    },
    clearSelectedContact: (state) => {
      state.selectedContact = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false
        state.contacts = action.payload.data || []
        state.pagination = { ...state.pagination, ...action.payload.pagination }
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch contact by ID
      .addCase(fetchContactById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedContact = action.payload.data
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false
        const updatedContact = action.payload.data
        const index = state.contacts.findIndex((c) => c._id === updatedContact._id)
        if (index !== -1) {
          state.contacts[index] = updatedContact
        }
        if (state.selectedContact?._id === updatedContact._id) {
          state.selectedContact = updatedContact
        }
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update contact status
      .addCase(updateContactStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedContact = action.payload.data
        const index = state.contacts.findIndex((c) => c._id === updatedContact._id)
        if (index !== -1) {
          state.contacts[index] = updatedContact
        }
        if (state.selectedContact?._id === updatedContact._id) {
          state.selectedContact = updatedContact
        }
      })
      .addCase(updateContactStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false
        state.contacts = state.contacts.filter((c) => c._id !== action.payload)
        if (state.selectedContact?._id === action.payload) {
          state.selectedContact = null
        }
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch stats
      .addCase(fetchContactStats.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchContactStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchContactStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, clearSelectedContact, clearError } = contactsSlice.actions
export default contactsSlice.reducer

