import api from './axios'

/** The user id comes from the JWT; /my is the only list endpoint the UI uses. */
const notificationApi = {
  getMine: () => api.get('/api/notifications/my').then((r) => r.data),

  markAsRead: (id) => api.put(`/api/notifications/${id}/read`).then((r) => r.data),
}

export default notificationApi
