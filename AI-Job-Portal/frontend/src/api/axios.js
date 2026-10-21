import axios from 'axios'

/**
 * The API Gateway is the only backend origin the frontend talks to.
 * Individual microservices are never called directly.
 */
function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!import.meta.env.PROD) {
    return configuredUrl || 'http://localhost:8080'
  }

  if (!configuredUrl) {
    // Let the static frontend render before its backend has been deployed.
    // API calls will use the current origin until a gateway URL is configured.
    return ''
  }

  let parsedUrl
  try {
    parsedUrl = new URL(configuredUrl)
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute HTTPS URL in production.')
  }

  const hostname = parsedUrl.hostname.toLowerCase()
  const isLoopback =
    hostname === 'localhost' || hostname === '[::1]' || /^127\./.test(hostname)

  if (parsedUrl.protocol !== 'https:' || isLoopback) {
    throw new Error(
      'VITE_API_BASE_URL must use HTTPS and must not point to localhost in production.',
    )
  }

  return configuredUrl.replace(/\/+$/, '')
}

export const API_BASE_URL = resolveApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

/**
 * The store is injected after it is created to avoid a circular import
 * (store -> slices -> api -> store).
 */
let getToken = () => null
let onUnauthorized = () => {}

export function configureApi({ tokenGetter, unauthorizedHandler }) {
  if (tokenGetter) getToken = tokenGetter
  if (unauthorizedHandler) onUnauthorized = unauthorizedHandler
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      // Expired or invalid token: drop the session and send the user to login.
      onUnauthorized()
    }

    return Promise.reject(error)
  },
)

/** Pulls a readable message out of whatever shape the backend returned. */
export function getErrorMessage(error, fallback = 'Something went wrong. Try again.') {
  if (!error) return fallback

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check that the API gateway is running on port 8080.'
  }

  if (error.message === 'Network Error') {
    if (!API_BASE_URL) {
      return 'The API backend is not configured yet. Please try again after it has been deployed.'
    }
    return 'Cannot reach the API gateway at ' + API_BASE_URL + '. Is the backend running?'
  }

  const data = error?.response?.data
  const asText = (value) => {
    if (typeof value === 'string' && value.trim()) return value
    if (value && typeof value === 'object') {
      if (typeof value.message === 'string' && value.message.trim()) return value.message
      if (typeof value.error === 'string' && value.error.trim()) return value.error
    }
    return null
  }

  const responseMessage = asText(data) || asText(data?.message) || asText(data?.error)
  if (responseMessage) return responseMessage

  // Spring validation errors arrive as a field -> message map.
  if (data && typeof data === 'object') {
    const first = Object.values(data).find((v) => typeof v === 'string')
    if (first) return first
  }

  return typeof error.message === 'string' && error.message.trim() ? error.message : fallback
}

export default api
