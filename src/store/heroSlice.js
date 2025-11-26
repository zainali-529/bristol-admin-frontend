import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { toast } from 'sonner';

// Async thunks
export const fetchHeroStats = createAsyncThunk(
  'hero/fetchHeroStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getHeroStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero stats');
    }
  }
);

export const fetchHeros = createAsyncThunk(
  'hero/fetchHeros',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getHeros(params);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch hero configurations');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero configurations');
    }
  }
);

export const fetchHeroById = createAsyncThunk(
  'hero/fetchHeroById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getHeroById(id);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch hero configuration');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero configuration');
    }
  }
);

export const createHero = createAsyncThunk(
  'hero/createHero',
  async (heroData, { rejectWithValue }) => {
    try {
      const response = await api.createHero(heroData);
      toast.success('Hero configuration created successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hero configuration');
      return rejectWithValue(error.response?.data?.message || 'Failed to create hero configuration');
    }
  }
);

export const updateHero = createAsyncThunk(
  'hero/updateHero',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.updateHero(id, data);
      toast.success('Hero configuration updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update hero configuration');
      return rejectWithValue(error.response?.data?.message || 'Failed to update hero configuration');
    }
  }
);

export const deleteHero = createAsyncThunk(
  'hero/deleteHero',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteHero(id);
      toast.success('Hero configuration deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete hero configuration');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete hero configuration');
    }
  }
);

export const uploadHeroVideo = createAsyncThunk(
  'hero/uploadVideo',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      const response = await api.uploadHeroVideo(id, formData);
      toast.success('Background video uploaded successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
      return rejectWithValue(error.response?.data?.message || 'Failed to upload video');
    }
  }
);

export const uploadHeroImage = createAsyncThunk(
  'hero/uploadImage',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.uploadHeroImage(id, formData);
      toast.success('Background image uploaded successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

export const deleteHeroMedia = createAsyncThunk(
  'hero/deleteMedia',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const response = await api.deleteHeroMedia(id, type);
      toast.success(`Background ${type} deleted successfully`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete media');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media');
    }
  }
);

export const setActiveHero = createAsyncThunk(
  'hero/setActiveHero',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.setActiveHero(id);
      toast.success('Hero configuration activated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate hero');
      return rejectWithValue(error.response?.data?.message || 'Failed to activate hero');
    }
  }
);

const heroSlice = createSlice({
  name: 'hero',
  initialState: {
    heros: [],
    activeHero: null,
    selectedHero: null,
    stats: {
      total: 0,
      active: 0,
      withVideo: 0,
      withImage: 0
    },
    filters: {
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    loading: false,
    error: null,
    uploadingMedia: false,
  },
  reducers: {
    clearSelectedHero: (state) => {
      state.selectedHero = null;
    },
    setSelectedHero: (state, action) => {
      state.selectedHero = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch hero stats
      .addCase(fetchHeroStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchHeroStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(fetchHeroStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch all heros
      .addCase(fetchHeros.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeros.fulfilled, (state, action) => {
        state.loading = false;
        state.heros = action.payload.data;
        state.activeHero = action.payload.data.find(hero => hero.isActive) || null;
      })
      .addCase(fetchHeros.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch hero by ID
      .addCase(fetchHeroById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHero = action.payload.data;
      })
      .addCase(fetchHeroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create hero
      .addCase(createHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHero.fulfilled, (state, action) => {
        state.loading = false;
        state.heros.unshift(action.payload.data);
        if (action.payload.data.isActive) {
          state.activeHero = action.payload.data;
          // Deactivate other heros
          state.heros = state.heros.map(hero => 
            hero._id !== action.payload.data._id 
              ? { ...hero, isActive: false }
              : hero
          );
        }
      })
      .addCase(createHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update hero
      .addCase(updateHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHero.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.heros.findIndex(hero => hero._id === action.payload.data._id);
        if (index !== -1) {
          state.heros[index] = action.payload.data;
        }
        if (state.selectedHero?._id === action.payload.data._id) {
          state.selectedHero = action.payload.data;
        }
        if (action.payload.data.isActive) {
          state.activeHero = action.payload.data;
        }
      })
      .addCase(updateHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete hero
      .addCase(deleteHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHero.fulfilled, (state, action) => {
        state.loading = false;
        state.heros = state.heros.filter(hero => hero._id !== action.payload);
        if (state.selectedHero?._id === action.payload) {
          state.selectedHero = null;
        }
      })
      .addCase(deleteHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload video
      .addCase(uploadHeroVideo.pending, (state) => {
        state.uploadingMedia = true;
        state.error = null;
      })
      .addCase(uploadHeroVideo.fulfilled, (state, action) => {
        state.uploadingMedia = false;
        const index = state.heros.findIndex(hero => hero._id === action.payload.data._id);
        if (index !== -1) {
          state.heros[index] = action.payload.data;
        }
        if (state.selectedHero?._id === action.payload.data._id) {
          state.selectedHero = action.payload.data;
        }
      })
      .addCase(uploadHeroVideo.rejected, (state, action) => {
        state.uploadingMedia = false;
        state.error = action.payload;
      })
      
      // Upload image
      .addCase(uploadHeroImage.pending, (state) => {
        state.uploadingMedia = true;
        state.error = null;
      })
      .addCase(uploadHeroImage.fulfilled, (state, action) => {
        state.uploadingMedia = false;
        const index = state.heros.findIndex(hero => hero._id === action.payload.data._id);
        if (index !== -1) {
          state.heros[index] = action.payload.data;
        }
        if (state.selectedHero?._id === action.payload.data._id) {
          state.selectedHero = action.payload.data;
        }
      })
      .addCase(uploadHeroImage.rejected, (state, action) => {
        state.uploadingMedia = false;
        state.error = action.payload;
      })
      
      // Delete media
      .addCase(deleteHeroMedia.pending, (state) => {
        state.uploadingMedia = true;
        state.error = null;
      })
      .addCase(deleteHeroMedia.fulfilled, (state, action) => {
        state.uploadingMedia = false;
        const index = state.heros.findIndex(hero => hero._id === action.payload.data._id);
        if (index !== -1) {
          state.heros[index] = action.payload.data;
        }
        if (state.selectedHero?._id === action.payload.data._id) {
          state.selectedHero = action.payload.data;
        }
      })
      .addCase(deleteHeroMedia.rejected, (state, action) => {
        state.uploadingMedia = false;
        state.error = action.payload;
      })
      
      // Set active hero
      .addCase(setActiveHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setActiveHero.fulfilled, (state, action) => {
        state.loading = false;
        state.activeHero = action.payload.data;
        // Deactivate all other heros
        state.heros = state.heros.map(hero => ({
          ...hero,
          isActive: hero._id === action.payload.data._id
        }));
        if (state.selectedHero?._id === action.payload.data._id) {
          state.selectedHero = action.payload.data;
        }
      })
      .addCase(setActiveHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedHero, setSelectedHero, setFilters, clearError } = heroSlice.actions;

export default heroSlice.reducer;


