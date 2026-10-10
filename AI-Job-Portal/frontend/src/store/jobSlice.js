import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import jobApi from '@/api/jobApi'
import { getErrorMessage } from '@/api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  employerJobs: [],
  employerStatus: 'idle',
  employerError: null,
  filters: {
    query: '',
    location: '',
    jobType: '',
    status: 'ACTIVE',
    experience: '',
    salaryMin: '',
  },
}

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await jobApi.getAll()
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not load jobs.'))
  }
})

export const fetchJobById = createAsyncThunk('jobs/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await jobApi.getById(id)
  } catch (error) {
    if (error?.response?.status === 404) return rejectWithValue('This job no longer exists.')
    return rejectWithValue(getErrorMessage(error, 'Could not load this job.'))
  }
})

export const fetchEmployerJobs = createAsyncThunk(
  'jobs/fetchEmployer',
  async (employerId, { rejectWithValue }) => {
    try {
      return await jobApi.getByEmployer(employerId)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your jobs.'))
    }
  },
)

export const createJob = createAsyncThunk('jobs/create', async (payload, { rejectWithValue }) => {
  try {
    return await jobApi.create(payload)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not publish this job.'))
  }
})

export const updateJobStatus = createAsyncThunk(
  'jobs/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await jobApi.updateStatus(id, status)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the job status.'))
    }
  },
)

export const deleteJob = createAsyncThunk('jobs/delete', async (id, { rejectWithValue }) => {
  try {
    await jobApi.remove(id)
    return id
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Could not delete this job.'))
  }
})

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = initialState.filters
    },
    clearCurrentJob(state) {
      state.current = null
      state.currentStatus = 'idle'
      state.currentError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload || []
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchJobById.pending, (state) => {
        state.currentStatus = 'loading'
        state.currentError = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.currentError = action.payload
      })
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.employerStatus = 'loading'
        state.employerError = null
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.employerStatus = 'succeeded'
        state.employerJobs = action.payload || []
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.employerStatus = 'failed'
        state.employerError = action.payload
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.employerJobs = [action.payload, ...state.employerJobs]
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const updated = action.payload
        state.employerJobs = state.employerJobs.map((job) =>
          job.id === updated.id ? updated : job,
        )
        if (state.current?.id === updated.id) state.current = updated
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.employerJobs = state.employerJobs.filter((job) => job.id !== action.payload)
      })
  },
})

export const { setFilters, resetFilters, clearCurrentJob } = jobSlice.actions
export default jobSlice.reducer
