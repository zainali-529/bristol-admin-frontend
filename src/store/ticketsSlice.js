import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params, { rejectWithValue }) => {
    try {
      const res = await apiService.getTickets(params)
      return res.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tickets')
    }
  }
)

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiService.getTicketById(id)
      return res.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch ticket')
    }
  }
)

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiService.createTicket(data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create ticket')
    }
  }
)

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiService.updateTicket(id, data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update ticket')
    }
  }
)

export const addTicketComment = createAsyncThunk(
  'tickets/addTicketComment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await apiService.addTicketComment(id, data)
      return { id, comment: res.data?.data }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add comment')
    }
  }
)

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    list: [],
    selected: null,
    pagination: { currentPage: 1, totalPages: 1, total: 0, limit: 5 },
    
    filters: { status: '', priority: '', category: '', search: '' },
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    setPaginationLimit: (state, action) => { state.pagination.limit = action.payload },
    clearSelectedTicket: (state) => { state.selected = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload
        state.list = payload.data || []
        state.pagination = {
          ...state.pagination,
          currentPage: payload.page || 1,
          totalPages: payload.totalPages || 1,
          total: payload.total || (payload.data ? payload.data.length : 0),
        }
      })
      .addCase(fetchTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchTicketById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTicketById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.data })
      .addCase(fetchTicketById.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(createTicket.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.list = [action.payload.data, ...state.list]
          state.pagination.total += 1
        }
      })
      .addCase(createTicket.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateTicket.fulfilled, (state, action) => {
        const updated = action.payload?.data
        const idx = state.list.findIndex(t => t._id === updated?._id)
        if (idx !== -1) state.list[idx] = updated
        if (state.selected?._id === updated?._id) state.selected = updated
      })

      .addCase(addTicketComment.fulfilled, (state, action) => {
        const { id, comment } = action.payload
        const ticket = state.list.find(t => t._id === id)
        if (ticket) {
          ticket.comments = ticket.comments || []
          ticket.comments.push(comment)
        }
        if (state.selected?._id === id) {
          state.selected.comments = state.selected.comments || []
          state.selected.comments.push(comment)
        }
      })
  }
})

export const { setFilters, setPaginationLimit, clearSelectedTicket } = ticketsSlice.actions
export default ticketsSlice.reducer
