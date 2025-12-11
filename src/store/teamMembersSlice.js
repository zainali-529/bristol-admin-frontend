import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchTeamMembers = createAsyncThunk(
  'teamMembers/fetchTeamMembers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getTeamMembers(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchTeamMemberById = createAsyncThunk(
  'teamMembers/fetchTeamMemberById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getTeamMemberById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createTeamMember = createAsyncThunk(
  'teamMembers/createTeamMember',
  async (teamMemberData, { rejectWithValue }) => {
    try {
      const response = await apiService.createTeamMember(teamMemberData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTeamMember = createAsyncThunk(
  'teamMembers/updateTeamMember',
  async ({ id, teamMemberData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTeamMember(id, teamMemberData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteTeamMember = createAsyncThunk(
  'teamMembers/deleteTeamMember',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteTeamMember(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTeamMemberStatus = createAsyncThunk(
  'teamMembers/updateTeamMemberStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTeamMemberStatus(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTeamMemberOrder = createAsyncThunk(
  'teamMembers/updateTeamMemberOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTeamMemberOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchTeamMemberStats = createAsyncThunk(
  'teamMembers/fetchTeamMemberStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTeamMemberStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const teamMembersSlice = createSlice({
  name: 'teamMembers',
  initialState: {
    teamMembers: [],
    selectedTeamMember: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalMembers: 0,
      totalItems: 0,
      limit: 5,
    },
    filters: {
      status: '',
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
    setSelectedTeamMember: (state, action) => {
      state.selectedTeamMember = action.payload
    },
    clearSelectedTeamMember: (state) => {
      state.selectedTeamMember = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Team Members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.teamMembers = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.currentPage || state.pagination.currentPage,
            totalPages: action.payload.totalPages || state.pagination.totalPages,
            totalMembers: action.payload.total || action.payload.count || state.pagination.totalMembers,
            totalItems: action.payload.total || action.payload.count || state.pagination.totalItems,
          }
        }
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Team Member By ID
      .addCase(fetchTeamMemberById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeamMemberById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedTeamMember = action.payload.data
      })
      .addCase(fetchTeamMemberById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Team Member
      .addCase(createTeamMember.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.teamMembers = [action.payload.data, ...state.teamMembers]
          state.pagination.totalMembers = (state.pagination.totalMembers || 0) + 1
          state.pagination.totalItems = (state.pagination.totalItems || 0) + 1
        }
      })
      .addCase(createTeamMember.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Team Member
      .addCase(updateTeamMember.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.loading = false
        const index = state.teamMembers.findIndex(m => m._id === action.payload.data._id)
        if (index !== -1) {
          state.teamMembers[index] = action.payload.data
        }
        if (state.selectedTeamMember?._id === action.payload.data._id) {
          state.selectedTeamMember = action.payload.data
        }
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Team Member
      .addCase(deleteTeamMember.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.loading = false
        state.teamMembers = state.teamMembers.filter(m => m._id !== action.payload)
        state.pagination.totalMembers = (state.pagination.totalMembers || 0) - 1
        state.pagination.totalItems = (state.pagination.totalItems || 0) - 1
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Team Member Status
      .addCase(updateTeamMemberStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTeamMemberStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.teamMembers.findIndex(m => m._id === action.payload.data._id)
        if (index !== -1) {
          state.teamMembers[index] = action.payload.data
        }
        if (state.selectedTeamMember?._id === action.payload.data._id) {
          state.selectedTeamMember = action.payload.data
        }
      })
      .addCase(updateTeamMemberStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Team Member Order
      .addCase(updateTeamMemberOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTeamMemberOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.teamMembers.findIndex(m => m._id === action.payload.data._id)
        if (index !== -1) {
          state.teamMembers[index] = action.payload.data
        }
        if (state.selectedTeamMember?._id === action.payload.data._id) {
          state.selectedTeamMember = action.payload.data
        }
      })
      .addCase(updateTeamMemberOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Team Member Stats
      .addCase(fetchTeamMemberStats.pending, (state) => {
        state.stats = null
        state.error = null
      })
      .addCase(fetchTeamMemberStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchTeamMemberStats.rejected, (state, action) => {
        state.stats = null
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedTeamMember, clearSelectedTeamMember } = teamMembersSlice.actions
export default teamMembersSlice.reducer

