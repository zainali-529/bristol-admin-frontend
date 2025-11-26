import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks
export const fetchTrustCards = createAsyncThunk(
  'whyTrustUs/fetchTrustCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTrustCards()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trust cards')
    }
  }
)

export const updateTrustCards = createAsyncThunk(
  'whyTrustUs/updateTrustCards',
  async ({ cards, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTrustCards({ cards, isActive })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update trust cards')
    }
  }
)

export const updateSingleCard = createAsyncThunk(
  'whyTrustUs/updateSingleCard',
  async ({ order, cardData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSingleTrustCard(order, cardData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update card')
    }
  }
)

export const updateTrustStatus = createAsyncThunk(
  'whyTrustUs/updateTrustStatus',
  async (isActive, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTrustStatus(isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status')
    }
  }
)

const initialState = {
  trustData: null,
  cards: [],
  isActive: true,
  loading: false,
  error: null,
  lastUpdated: null,
}

const whyTrustUsSlice = createSlice({
  name: 'whyTrustUs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateLocalCard: (state, action) => {
      const { order, cardData } = action.payload
      const cardIndex = state.cards.findIndex(card => card.order === order)
      if (cardIndex !== -1) {
        state.cards[cardIndex] = { ...state.cards[cardIndex], ...cardData }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trust cards
      .addCase(fetchTrustCards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTrustCards.fulfilled, (state, action) => {
        state.loading = false
        state.trustData = action.payload.data
        state.cards = action.payload.data?.cards || []
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(fetchTrustCards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update trust cards
      .addCase(updateTrustCards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTrustCards.fulfilled, (state, action) => {
        state.loading = false
        state.trustData = action.payload.data
        state.cards = action.payload.data?.cards || []
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateTrustCards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update single card
      .addCase(updateSingleCard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSingleCard.fulfilled, (state, action) => {
        state.loading = false
        state.trustData = action.payload.data
        state.cards = action.payload.data?.cards || []
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateSingleCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update status
      .addCase(updateTrustStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTrustStatus.fulfilled, (state, action) => {
        state.loading = false
        state.trustData = action.payload.data
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateTrustStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateLocalCard } = whyTrustUsSlice.actions
export default whyTrustUsSlice.reducer
