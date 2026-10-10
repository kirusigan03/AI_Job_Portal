import api from './axios'

/**
 * Upload is multipart/form-data. candidateId comes from the JWT, so the
 * form carries only the file and the primaryResume flag.
 */
const resumeApi = {
  upload: (file, primaryResume = false, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('primaryResume', String(primaryResume))

    return api
      .post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then((r) => r.data)
  },

  getMyResumes: () => api.get('/api/resumes/my').then((r) => r.data),

  getById: (id) => api.get(`/api/resumes/${id}`).then((r) => r.data),

  getByCandidate: (candidateId) =>
    api.get(`/api/resumes/candidate/${candidateId}`).then((r) => r.data),

  remove: (id) => api.delete(`/api/resumes/${id}`).then((r) => r.data),
}

export default resumeApi
