import api from './axios'

/**
 * candidateId is never sent from the client - application-service reads it
 * from the JWT. Status updates are restricted to EMPLOYER and ADMIN by the
 * backend, and the status travels in the request body.
 */
const applicationApi = {
  apply: ({ jobId, resumeId }) =>
    api.post('/api/applications', { jobId, resumeId }).then((r) => r.data),

  getMyApplications: () => api.get('/api/applications/my').then((r) => r.data),

  getById: (id) => api.get(`/api/applications/${id}`).then((r) => r.data),

  getByJob: (jobId) => api.get(`/api/applications/job/${jobId}`).then((r) => r.data),

  getByCandidate: (candidateId) =>
    api.get(`/api/applications/candidate/${candidateId}`).then((r) => r.data),

  updateStatus: (id, status) =>
    api.put(`/api/applications/${id}/status`, { status }).then((r) => r.data),
}

export default applicationApi


