import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

const initialState = {
  loading: false,
  error: null,
  energy: null,
  energyList: [],
  contactStats: null,
  quoteStats: null,
  supplierStats: null,
  newsStats: null,
  faqStats: null,
  tmStats: null,
  documentStats: null,
  heroStats: null,
  recentQuotes: [],
  recentContacts: [],
  lastFetched: null,
  statsLastUpdated: null,
}

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [
        energyRes,
        energyListRes,
        contactsRes,
        quotesRes,
        suppliersRes,
        newsRes,
        faqsRes,
        teamRes,
        docsRes,
        heroRes,
        quotesListRes,
        contactsListRes,
      ] = await Promise.all([
        apiService.getCurrentEnergyPrice(),
        apiService.getEnergyPrices({ page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
        apiService.getContactStats(),
        apiService.getQuoteStats(),
        apiService.getSupplierStats(),
        apiService.getNewsStats(),
        apiService.getFAQStats(),
        apiService.getTeamMemberStats(),
        apiService.getDocumentStats?.(),
        apiService.getHeroStats?.(),
        apiService.getQuotes({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        apiService.getContacts({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ])

      return {
        energy: energyRes?.data?.data || energyRes?.data || null,
        energyList: energyListRes?.data?.data || [],
        contactStats: contactsRes?.data?.data || null,
        quoteStats: quotesRes?.data?.data || null,
        supplierStats: suppliersRes?.data?.data || null,
        newsStats: newsRes?.data?.data || null,
        faqStats: faqsRes?.data?.data || null,
        tmStats: teamRes?.data?.data || null,
        documentStats: docsRes?.data?.data || null,
        heroStats: heroRes?.data?.data || null,
        recentQuotes: quotesListRes?.data?.data || [],
        recentContacts: contactsListRes?.data?.data || [],
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async ({ dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      const paramsQuotes = { page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
      const paramsContacts = { page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }
      if (dateFrom) { paramsQuotes.dateFrom = dateFrom; paramsContacts.dateFrom = dateFrom }
      if (dateTo) { paramsQuotes.dateTo = dateTo; paramsContacts.dateTo = dateTo }
      const [qRes, cRes] = await Promise.all([
        apiService.getQuotes(paramsQuotes),
        apiService.getContacts(paramsContacts),
      ])
      return {
        recentQuotes: qRes?.data?.data || [],
        recentContacts: cRes?.data?.data || [],
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activity')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.energy = action.payload.energy
        state.energyList = action.payload.energyList
        state.contactStats = action.payload.contactStats
        state.quoteStats = action.payload.quoteStats
        state.supplierStats = action.payload.supplierStats
        state.newsStats = action.payload.newsStats
        state.faqStats = action.payload.faqStats
        state.tmStats = action.payload.tmStats
        state.documentStats = action.payload.documentStats
        state.heroStats = action.payload.heroStats
        state.recentQuotes = action.payload.recentQuotes
        state.recentContacts = action.payload.recentContacts
        state.lastFetched = Date.now()
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.contactStats = action.payload.contactStats
        state.quoteStats = action.payload.quoteStats
        state.statsLastUpdated = Date.now()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentQuotes = action.payload.recentQuotes
        state.recentContacts = action.payload.recentContacts
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export default dashboardSlice.reducer
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const [contactsRes, quotesRes] = await Promise.all([
        apiService.getContactStats(),
        apiService.getQuoteStats(),
      ])
      return {
        contactStats: contactsRes?.data?.data || null,
        quoteStats: quotesRes?.data?.data || null,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh stats')
    }
  }
)
