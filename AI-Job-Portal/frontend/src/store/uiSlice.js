import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      prepare({ title, description, variant = 'default' }) {
        return { payload: { id: nanoid(), title, description, variant } }
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { pushToast, dismissToast } = uiSlice.actions

export const toast = {
  success: (title, description) => pushToast({ title, description, variant: 'success' }),
  error: (title, description) => pushToast({ title, description, variant: 'destructive' }),
  info: (title, description) => pushToast({ title, description, variant: 'default' }),
}

export default uiSlice.reducer
