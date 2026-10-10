import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout } from './authSlice'
import jobReducer from './jobSlice'
import applicationReducer from './applicationSlice'
import resumeReducer from './resumeSlice'
import notificationReducer from './notificationSlice'
import uiReducer, { pushToast } from './uiSlice'
import { configureApi } from '@/api/axios'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    resumes: resumeReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // File objects are passed to the upload thunk and are not serialisable.
        ignoredActionPaths: ['meta.arg.file'],
      },
    }),
})

let redirecting = false

/**
 * Wires the axios client to the store: every request reads the current token,
 * and a 401 tears the session down and returns the user to the login screen.
 */
configureApi({
  tokenGetter: () => store.getState().auth.token,
  unauthorizedHandler: () => {
    const hadSession = Boolean(store.getState().auth.token)
    store.dispatch(logout())

    if (hadSession && !redirecting) {
      redirecting = true
      store.dispatch(
        pushToast({
          title: 'Session expired',
          description: 'Sign in again to continue.',
          variant: 'destructive',
        }),
      )
      const next = window.location.pathname + window.location.search
      window.location.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  },
})
