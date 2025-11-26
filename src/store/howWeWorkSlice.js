import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '@/services/api'

// Async thunks
export const fetchHowWeWork = createAsyncThunk(
  'howWeWork/fetchHowWeWork',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getHowWeWork()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch how we work data')
    }
  }
)

export const updateHowWeWork = createAsyncThunk(
  'howWeWork/updateHowWeWork',
  async ({ steps, isActive }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      
      // Add steps as JSON
      formData.append('steps', JSON.stringify(steps))
      if (typeof isActive === 'boolean') {
        formData.append('isActive', isActive)
      }
      
      // Add images if they are File objects
      steps.forEach((step, index) => {
        if (step.imageFile && step.imageFile instanceof File) {
          formData.append(`stepImage${index + 1}`, step.imageFile)
        }
      })
      
      const response = await apiService.updateHowWeWork(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update how we work')
    }
  }
)

export const updateSingleStep = createAsyncThunk(
  'howWeWork/updateSingleStep',
  async ({ order, stepData }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      
      if (stepData.title !== undefined) {
        formData.append('title', stepData.title)
      }
      if (stepData.description !== undefined) {
        formData.append('description', stepData.description)
      }
      if (stepData.imageAlt !== undefined) {
        formData.append('imageAlt', stepData.imageAlt)
      }
      if (stepData.imageFile && stepData.imageFile instanceof File) {
        formData.append('stepImage', stepData.imageFile)
      }
      
      const response = await apiService.updateSingleStep(order, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update step')
    }
  }
)

export const updateHowWeWorkStatus = createAsyncThunk(
  'howWeWork/updateHowWeWorkStatus',
  async (isActive, { rejectWithValue }) => {
    try {
      const response = await apiService.updateHowWeWorkStatus(isActive)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status')
    }
  }
)

const initialState = {
  howWeWorkData: null,
  steps: [],
  isActive: true,
  loading: false,
  error: null,
  lastUpdated: null,
}

const howWeWorkSlice = createSlice({
  name: 'howWeWork',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch how we work
      .addCase(fetchHowWeWork.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHowWeWork.fulfilled, (state, action) => {
        state.loading = false
        state.howWeWorkData = action.payload.data
        state.steps = action.payload.data?.steps || []
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(fetchHowWeWork.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update how we work
      .addCase(updateHowWeWork.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateHowWeWork.fulfilled, (state, action) => {
        state.loading = false
        state.howWeWorkData = action.payload.data
        state.steps = action.payload.data?.steps || []
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateHowWeWork.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update single step
      .addCase(updateSingleStep.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSingleStep.fulfilled, (state, action) => {
        state.loading = false
        state.howWeWorkData = action.payload.data
        state.steps = action.payload.data?.steps || []
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateSingleStep.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update status
      .addCase(updateHowWeWorkStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateHowWeWorkStatus.fulfilled, (state, action) => {
        state.loading = false
        state.howWeWorkData = action.payload.data
        state.isActive = action.payload.data?.isActive ?? true
        state.lastUpdated = action.payload.data?.updatedAt
      })
      .addCase(updateHowWeWorkStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = howWeWorkSlice.actions
export default howWeWorkSlice.reducer

