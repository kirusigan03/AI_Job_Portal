import api from './axios'

/**
 * POST /api/auth/register -> plain-text confirmation string
 * POST /api/auth/login    -> { token, userId, email, role }
 */
const authApi = {
  register: ({ email, password, role }) =>
    api.post('/api/auth/register', { email, password, role }).then((r) => r.data),

  login: ({ email, password }) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data),
}

export default authApi
