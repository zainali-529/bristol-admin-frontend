import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getNews(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchNewsById = createAsyncThunk(
  'news/fetchNewsById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getNewsById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createNews = createAsyncThunk(
  'news/createNews',
  async (newsData, { rejectWithValue }) => {
    try {
      const response = await apiService.createNews(newsData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, newsData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateNews(id, newsData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteNews(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateNewsStatus = createAsyncThunk(
  'news/updateNewsStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateNewsStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateNewsActive = createAsyncThunk(
  'news/updateNewsActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateNewsActive(id, isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateNewsOrder = createAsyncThunk(
  'news/updateNewsOrder',
  async ({ id, displayOrder }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateNewsOrder(id, displayOrder)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchNewsStats = createAsyncThunk(
  'news/fetchNewsStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getNewsStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchNewsCategories = createAsyncThunk(
  'news/fetchNewsCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getNewsCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    news: [],
    selectedNews: null,
    categories: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalNews: 0,
      totalItems: 0,
      limit: 5,
    },
    filters: {
      status: '',
      category: '',
      featured: '',
      isActive: '',
      search: '',
      sortBy: 'publishDate',
      sortOrder: 'desc',
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
    setSelectedNews: (state, action) => {
      state.selectedNews = action.payload
    },
    clearSelectedNews: (state) => {
      state.selectedNews = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.news = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.currentPage || state.pagination.currentPage,
            totalPages: action.payload.totalPages || state.pagination.totalPages,
            totalNews: action.payload.total || action.payload.count || state.pagination.totalNews,
            totalItems: action.payload.total || action.payload.count || state.pagination.totalItems,
          }
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch News By ID
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedNews = action.payload.data
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create News
      .addCase(createNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.news = [action.payload.data, ...state.news]
          state.pagination.totalNews = (state.pagination.totalNews || 0) + 1
        }
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update News
      .addCase(updateNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false
        const index = state.news.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.news[index] = action.payload.data
        }
        if (state.selectedNews?._id === action.payload.data._id) {
          state.selectedNews = action.payload.data
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete News
      .addCase(deleteNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false
        state.news = state.news.filter(n => n._id !== action.payload)
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update News Status
      .addCase(updateNewsStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNewsStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.news.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.news[index] = action.payload.data
        }
        if (state.selectedNews?._id === action.payload.data._id) {
          state.selectedNews = action.payload.data
        }
      })
      .addCase(updateNewsStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update News Active
      .addCase(updateNewsActive.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNewsActive.fulfilled, (state, action) => {
        state.loading = false
        const index = state.news.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.news[index] = action.payload.data
        }
        if (state.selectedNews?._id === action.payload.data._id) {
          state.selectedNews = action.payload.data
        }
      })
      .addCase(updateNewsActive.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update News Order
      .addCase(updateNewsOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNewsOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.news.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.news[index] = action.payload.data
        }
        if (state.selectedNews?._id === action.payload.data._id) {
          state.selectedNews = action.payload.data
        }
      })
      .addCase(updateNewsOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch News Stats
      .addCase(fetchNewsStats.pending, (state) => {
        state.stats = null
        state.error = null
      })
      .addCase(fetchNewsStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchNewsStats.rejected, (state, action) => {
        state.stats = null
        state.error = action.payload
      })
      // Fetch News Categories
      .addCase(fetchNewsCategories.pending, (state) => {
        state.error = null
      })
      .addCase(fetchNewsCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || []
      })
      .addCase(fetchNewsCategories.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedNews, clearSelectedNews } = newsSlice.actions
export default newsSlice.reducer

