import api from './axios'

/**
 * Evaluations are produced asynchronously: applying publishes a Kafka event,
 * ai-service scores the resume against the job, and the result lands here.
 * A 202 means "not scored yet" while the Kafka-driven evaluation is pending.
 */
const aiApi = {
  getForApplication: (applicationId) =>
    api.get(`/api/ai/applications/${applicationId}`).then((r) =>
      r.status === 202 ? null : r.data,
    ),

  getForResume: (resumeId) =>
    api.get(`/api/ai/resume/${resumeId}`).then((r) =>
      r.status === 202 ? null : r.data,
    ),
}

export default aiApi
