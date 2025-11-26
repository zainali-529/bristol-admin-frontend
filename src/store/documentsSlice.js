import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocuments(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocumentById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (documentData, { rejectWithValue }) => {
    try {
      const response = await apiService.createDocument(documentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, documentData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateDocument(id, documentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const uploadNewVersion = createAsyncThunk(
  'documents/uploadNewVersion',
  async ({ id, versionData }, { rejectWithValue }) => {
    try {
      const response = await apiService.uploadNewVersion(id, versionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteDocument(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const downloadDocument = createAsyncThunk(
  'documents/downloadDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.downloadDocument(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchDocumentStats = createAsyncThunk(
  'documents/fetchDocumentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocumentStats()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchDocumentCategories = createAsyncThunk(
  'documents/fetchDocumentCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocumentCategories()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchDocumentFileTypes = createAsyncThunk(
  'documents/fetchDocumentFileTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDocumentFileTypes()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    selectedDocument: null,
    categories: [],
    fileTypes: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 0,
      totalItems: 0,
      limit: 10,
    },
    filters: {
      status: '',
      category: '',
      fileType: '',
      tag: '',
      accessLevel: '',
      search: '',
      sortBy: 'uploadedAt',
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
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload
    },
    clearSelectedDocument: (state) => {
      state.selectedDocument = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.documents = action.payload.data
          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.currentPage || state.pagination.currentPage,
            totalPages: action.payload.totalPages || state.pagination.totalPages,
            totalDocuments: action.payload.total || action.payload.count || state.pagination.totalDocuments,
            totalItems: action.payload.total || action.payload.count || state.pagination.totalItems,
          }
        }
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Document By ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDocument = action.payload.data
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Document
      .addCase(createDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data) {
          state.documents = [action.payload.data, ...state.documents]
          state.pagination.totalDocuments = (state.pagination.totalDocuments || 0) + 1
        }
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false
        const index = state.documents.findIndex(d => d._id === action.payload.data._id)
        if (index !== -1) {
          state.documents[index] = action.payload.data
        }
        if (state.selectedDocument?._id === action.payload.data._id) {
          state.selectedDocument = action.payload.data
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload New Version
      .addCase(uploadNewVersion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadNewVersion.fulfilled, (state, action) => {
        state.loading = false
        const index = state.documents.findIndex(d => d._id === action.payload.data._id)
        if (index !== -1) {
          state.documents[index] = action.payload.data
        }
        if (state.selectedDocument?._id === action.payload.data._id) {
          state.selectedDocument = action.payload.data
        }
      })
      .addCase(uploadNewVersion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false
        state.documents = state.documents.filter(d => d._id !== action.payload)
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Download Document
      .addCase(downloadDocument.pending, (state) => {
        state.error = null
      })
      .addCase(downloadDocument.fulfilled, (state) => {
        // Download handled in component
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch Document Stats
      .addCase(fetchDocumentStats.pending, (state) => {
        state.stats = null
        state.error = null
      })
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.stats = action.payload.data
      })
      .addCase(fetchDocumentStats.rejected, (state, action) => {
        state.stats = null
        state.error = action.payload
      })
      // Fetch Document Categories
      .addCase(fetchDocumentCategories.pending, (state) => {
        state.error = null
      })
      .addCase(fetchDocumentCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || []
      })
      .addCase(fetchDocumentCategories.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch Document File Types
      .addCase(fetchDocumentFileTypes.pending, (state) => {
        state.error = null
      })
      .addCase(fetchDocumentFileTypes.fulfilled, (state, action) => {
        state.fileTypes = action.payload.data || []
      })
      .addCase(fetchDocumentFileTypes.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setFilters, setPaginationLimit, setSelectedDocument, clearSelectedDocument } = documentsSlice.actions
export default documentsSlice.reducer

