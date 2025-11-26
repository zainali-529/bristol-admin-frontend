import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks for API calls
export const fetchActiveTheme = createAsyncThunk(
  'themes/fetchActiveTheme',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getActiveTheme()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateTheme = createAsyncThunk(
  'themes/updateTheme',
  async (themeData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTheme(themeData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updatePrimaryColor = createAsyncThunk(
  'themes/updatePrimaryColor',
  async (primaryColor, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePrimaryColor({ primaryColor })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const uploadLogo = createAsyncThunk(
  'themes/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const response = await apiService.uploadLogo(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const uploadFavicon = createAsyncThunk(
  'themes/uploadFavicon',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('favicon', file)
      const response = await apiService.uploadFavicon(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteLogo = createAsyncThunk(
  'themes/deleteLogo',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.deleteLogo()
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const deleteFavicon = createAsyncThunk(
  'themes/deleteFavicon',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.deleteFavicon()
      return null
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const resetTheme = createAsyncThunk(
  'themes/resetTheme',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.resetTheme()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const themesSlice = createSlice({
  name: 'themes',
  initialState: {
    activeTheme: null,
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active Theme
      .addCase(fetchActiveTheme.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveTheme.fulfilled, (state, action) => {
        state.loading = false
        state.activeTheme = action.payload.data
      })
      .addCase(fetchActiveTheme.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Theme
      .addCase(updateTheme.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.loading = false
        state.activeTheme = action.payload.data
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Primary Color
      .addCase(updatePrimaryColor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePrimaryColor.fulfilled, (state, action) => {
        state.loading = false
        if (state.activeTheme) {
          state.activeTheme.primaryColor = action.payload.data.primaryColor
          state.activeTheme.colorVariations = action.payload.data.colorVariations
          state.activeTheme.cssVariables = action.payload.data.cssVariables
        }
      })
      .addCase(updatePrimaryColor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Logo
      .addCase(uploadLogo.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.uploading = false
        if (state.activeTheme) {
          if (!state.activeTheme.branding) {
            state.activeTheme.branding = {}
          }
          state.activeTheme.branding.logoUrl = action.payload.data.logoUrl
        }
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })
      // Upload Favicon
      .addCase(uploadFavicon.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadFavicon.fulfilled, (state, action) => {
        state.uploading = false
        if (state.activeTheme) {
          if (!state.activeTheme.branding) {
            state.activeTheme.branding = {}
          }
          state.activeTheme.branding.faviconUrl = action.payload.data.faviconUrl
        }
      })
      .addCase(uploadFavicon.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })
      // Delete Logo
      .addCase(deleteLogo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLogo.fulfilled, (state) => {
        state.loading = false
        if (state.activeTheme?.branding) {
          state.activeTheme.branding.logoUrl = null
        }
      })
      .addCase(deleteLogo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Favicon
      .addCase(deleteFavicon.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFavicon.fulfilled, (state) => {
        state.loading = false
        if (state.activeTheme?.branding) {
          state.activeTheme.branding.faviconUrl = null
        }
      })
      .addCase(deleteFavicon.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reset Theme
      .addCase(resetTheme.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetTheme.fulfilled, (state, action) => {
        state.loading = false
        state.activeTheme = action.payload.data
      })
      .addCase(resetTheme.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = themesSlice.actions
export default themesSlice.reducer

