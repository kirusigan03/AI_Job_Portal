import api from './axios'

/**
 * GET routes on /api/jobs are public, so job browsing works signed out.
 * Creating, closing and deleting a job requires an EMPLOYER token, and the
 * backend takes employerId from the JWT - it is never sent by the client.
 */
const jobApi = {
  getAll: () => api.get('/api/jobs').then((r) => r.data),

  getById: (id) => api.get(`/api/jobs/${id}`).then((r) => r.data),

  getByEmployer: (employerId) =>
    api.get(`/api/jobs/employer/${employerId}`).then((r) => r.data),

  searchByTitle: (title) =>
    api.get('/api/jobs/search/title', { params: { title } }).then((r) => r.data),

  searchByLocation: (location) =>
    api.get('/api/jobs/search/location', { params: { location } }).then((r) => r.data),

  create: (payload) => api.post('/api/jobs', payload).then((r) => r.data),

  // Status is a query parameter on this endpoint, not a body.
  updateStatus: (id, status) =>
    api.put(`/api/jobs/${id}/status`, null, { params: { status } }).then((r) => r.data),

  remove: (id) => api.delete(`/api/jobs/${id}`).then((r) => r.data),
}

export default jobApi
