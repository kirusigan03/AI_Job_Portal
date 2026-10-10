import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authApi from '@/api/authApi'
import userApi from '@/api/userApi'
import { getErrorMessage } from '@/api/axios'

const STORAGE_KEY = 'smartjob.auth'

/**
 * The session is persisted so a refresh does not log the user out.
 * Only the values the login response returns are stored - never a secret.
 */
function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage can be unavailable in private modes; the session stays in memory */
  }
}

const stored = readStoredSession()

const initialState = {
  token: stored?.token || null,
  userId: stored?.userId || null,
  email: stored?.email || null,
  role: stored?.role || null,
  profile: null,
  profileLoaded: false,
  status: 'idle',
  error: null,
  registerStatus: 'idle',
  registerError: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials)
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Those credentials did not work. Check your email and password.'),
      )
    }
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Registration failed.'))
    }
  },
)

export const fetchMyProfile = createAsyncThunk(
  'auth/fetchMyProfile',
  async (_, { getState, rejectWithValue }) => {
    const { userId } = getState().auth
    if (!userId) return rejectWithValue('No signed in user')

    try {
      return await userApi.getProfile(userId)
    } catch (error) {
      // 404 simply means the profile has not been created yet.
      if (error?.response?.status === 404) return null
      return rejectWithValue(getErrorMessage(error, 'Could not load your profile.'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.userId = null
      state.email = null
      state.role = null
      state.profile = null
      state.profileLoaded = false
      state.status = 'idle'
      state.error = null
      writeStoredSession(null)
    },
    clearAuthError(state) {
      state.error = null
      state.registerError = null
    },
    setProfile(state, action) {
      state.profile = action.payload
      state.profileLoaded = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token, userId, email, role } = action.payload
        state.status = 'succeeded'
        state.token = token
        state.userId = userId
        state.email = email
        state.role = role
        writeStoredSession({ token, userId, email, role })
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Sign in failed.'
      })
      .addCase(register.pending, (state) => {
        state.registerStatus = 'loading'
        state.registerError = null
      })
      .addCase(register.fulfilled, (state) => {
        state.registerStatus = 'succeeded'
      })
      .addCase(register.rejected, (state, action) => {
        state.registerStatus = 'failed'
        state.registerError = action.payload || 'Registration failed.'
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.profileLoaded = true
      })
      .addCase(fetchMyProfile.rejected, (state) => {
        state.profileLoaded = true
      })
  },
})

export const { logout, clearAuthError, setProfile } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectRole = (state) => state.auth.role

export default authSlice.reducer
