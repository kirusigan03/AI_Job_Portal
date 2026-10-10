import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import applicationApi from '@/api/applicationApi'
import { getErrorMessage } from '@/api/axios'

const initialState = {
  mine: [],
  mineStatus: 'idle',
  mineError: null,
  updatingId: null,
}

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await applicationApi.getMyApplications()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your applications.'))
    }
  },
)

export const applyToJob = createAsyncThunk(
  'applications/apply',
  async ({ jobId, resumeId }, { rejectWithValue }) => {
    try {
      return await applicationApi.apply({ jobId, resumeId })
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not submit your application.'))
    }
  },
)

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await applicationApi.updateStatus(id, status)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the application status.'))
    }
  },
)

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.mineStatus = 'loading'
        state.mineError = null
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded'
        state.mine = action.payload || []
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.mineStatus = 'failed'
        state.mineError = action.payload
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.mine = [action.payload, ...state.mine]
      })
      .addCase(updateApplicationStatus.pending, (state, action) => {
        state.updatingId = action.meta.arg.id
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.updatingId = null
        state.mine = state.mine.map((a) => (a.id === action.payload.id ? action.payload : a))
      })
      .addCase(updateApplicationStatus.rejected, (state) => {
        state.updatingId = null
      })
  },
})

export default applicationSlice.reducer
