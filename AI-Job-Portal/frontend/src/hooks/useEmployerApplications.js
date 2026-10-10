import { useCallback, useEffect, useMemo, useState } from 'react'
import jobApi from '@/api/jobApi'
import applicationApi from '@/api/applicationApi'
import aiApi from '@/api/aiApi'
import userApi from '@/api/userApi'
import { getErrorMessage } from '@/api/axios'

/**
 * application-service has no "applications across all my jobs" endpoint, so the
 * list is assembled here: the employer's jobs, then the applications on each,
 * then the evaluation and candidate profile for each application.
 *
 * Only candidates who applied to this employer's own jobs are ever looked up.
 */
export function useEmployerApplications(employerId) {
  const [jobs, setJobs] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!employerId) return

    setLoading(true)
    setError(null)

    try {
      const employerJobs = await jobApi.getByEmployer(employerId)
      setJobs(employerJobs)

      const perJob = await Promise.all(
        employerJobs.map(async (job) => {
          try {
            const applications = await applicationApi.getByJob(job.id)
            return applications.map((application) => ({ application, job }))
          } catch {
            return []
          }
        }),
      )

      const flat = perJob.flat()

      // Evaluations and profiles are optional: a missing one is a normal state.
      const enriched = await Promise.all(
        flat.map(async ({ application, job }) => {
          const [analysis, candidate] = await Promise.all([
            aiApi.getForApplication(application.id).catch(() => null),
            userApi.getProfile(application.candidateId).catch(() => null),
          ])

          return { application, job, analysis, candidate }
        }),
      )

      setRows(enriched)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load applications for your jobs.'))
    } finally {
      setLoading(false)
    }
  }, [employerId])

  useEffect(() => {
    load()
  }, [load])

  /** Applying a status change locally avoids refetching the whole tree. */
  const applyStatusChange = useCallback((updated) => {
    setRows((previous) =>
      previous.map((row) =>
        row.application.id === updated.id ? { ...row, application: updated } : row,
      ),
    )
  }, [])

  const stats = useMemo(() => {
    const count = (status) => rows.filter((row) => row.application.status === status).length

    return {
      activeJobs: jobs.filter((job) => job.status === 'ACTIVE').length,
      totalJobs: jobs.length,
      applications: rows.length,
      shortlisted: count('SHORTLISTED'),
      interviews: count('INTERVIEW'),
      selected: count('SELECTED'),
      newApplications: count('APPLIED'),
    }
  }, [rows, jobs])

  return { jobs, rows, stats, loading, error, reload: load, applyStatusChange }
}
