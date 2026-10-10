import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import resumeApi from '@/api/resumeApi'
import { getErrorMessage } from '@/api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  uploadStatus: 'idle',
  uploadError: null,
  uploadProgress: 0,
}

export const fetchMyResumes = createAsyncThunk(
  'resumes/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await resumeApi.getMyResumes()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your resumes.'))
    }
  },
)

export const uploadResume = createAsyncThunk(
  'resumes/upload',
  async ({ file, primaryResume }, { dispatch, rejectWithValue }) => {
    try {
      const result = await resumeApi.upload(file, primaryResume, (event) => {
        if (!event.total) return
        dispatch(setUploadProgress(Math.round((event.loaded / event.total) * 100)))
      })
      // The upload response is a summary, so the list is refetched for full records.
      await dispatch(fetchMyResumes())
      return result
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Upload failed.'))
    }
  },
)

export const deleteResume = createAsyncThunk(
  'resumes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await resumeApi.remove(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not delete this resume.'))
    }
  },
)

const resumeSlice = createSlice({
  name: 'resumes',
  initialState,
  reducers: {
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload
    },
    clearUploadState(state) {
      state.uploadStatus = 'idle'
      state.uploadError = null
      state.uploadProgress = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyResumes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMyResumes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload || []
      })
      .addCase(fetchMyResumes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(uploadResume.pending, (state) => {
        state.uploadStatus = 'loading'
        state.uploadError = null
        state.uploadProgress = 0
      })
      .addCase(uploadResume.fulfilled, (state) => {
        state.uploadStatus = 'succeeded'
        state.uploadProgress = 100
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploadStatus = 'failed'
        state.uploadError = action.payload
        state.uploadProgress = 0
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload)
      })
  },
})

export const { setUploadProgress, clearUploadState } = resumeSlice.actions

/** Resumes are listed newest first, with the primary one pinned to the top. */
export const selectSortedResumes = createSelector(
  [(state) => state.resumes.items],
  (items) => [...items].sort((a, b) => {
    if (a.primaryResume !== b.primaryResume) return a.primaryResume ? -1 : 1
    return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
  })
)

export default resumeSlice.reducer
