import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import notificationApi from '@/api/notificationApi'
import { getErrorMessage } from '@/api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

/** Jackson serialises the boolean getter isRead() as "read". */
function isUnread(notification) {
  return !(notification.read ?? notification.isRead ?? false)
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationApi.getMine()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load notifications.'))
    }
  },
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not mark this as read.'))
    }
  },
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications(state) {
      state.items = []
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = (action.payload || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        )
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((n) =>
          n.id === action.payload ? { ...n, read: true, isRead: true } : n,
        )
      })
  },
})

export const { clearNotifications } = notificationSlice.actions

export const selectUnreadCount = (state) => state.notifications.items.filter(isUnread).length
export { isUnread }

export default notificationSlice.reducer
