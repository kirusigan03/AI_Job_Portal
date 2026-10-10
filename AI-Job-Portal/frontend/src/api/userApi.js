import api from './axios'

/**
 * user-service exposes the profile under the authenticated user's id.
 * A profile does not exist until it is created once, so the UI treats a
 * 404 from getProfile as "not set up yet" rather than an error.
 */
const userApi = {
  getProfile: (userId) =>
    api.get(`/api/users/${userId}/profile`).then((r) => r.data),

  createProfile: (userId, email, payload) =>
    api
      .post(`/api/users/${userId}/profile`, payload, { params: { email } })
      .then((r) => r.data),

  updateProfile: (userId, payload) =>
    api.put(`/api/users/${userId}/profile`, payload).then((r) => r.data),

  getAllProfiles: () => api.get('/api/users').then((r) => r.data),
}

export default userApi
