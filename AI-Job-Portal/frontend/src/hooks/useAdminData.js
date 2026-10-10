import { useCallback, useEffect, useMemo, useState } from 'react'
import jobApi from '@/api/jobApi'
import userApi from '@/api/userApi'
import applicationApi from '@/api/applicationApi'
import { getErrorMessage } from '@/api/axios'

/**
 * There is no cross-service reporting endpoint, so the admin view is composed
 * from the list endpoints each service does expose. Applications are gathered
 * per job, which is why this is fetched once and shared by the admin pages.
 */
export function useAdminData() {
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [profiles, allJobs] = await Promise.all([
        userApi.getAllProfiles().catch(() => []),
        jobApi.getAll(),
      ])

      setUsers(profiles)
      setJobs(allJobs)

      const perJob = await Promise.all(
        allJobs.map(async (job) => {
          try {
            const rows = await applicationApi.getByJob(job.id)
            return rows.map((application) => ({ application, job }))
          } catch {
            return []
          }
        }),
      )

      setApplications(perJob.flat())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load platform data.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const count = (status) => applications.filter((row) => row.application.status === status).length

    return {
      users: users.length,
      jobs: jobs.length,
      activeJobs: jobs.filter((job) => job.status === 'ACTIVE').length,
      closedJobs: jobs.filter((job) => job.status === 'CLOSED').length,
      applications: applications.length,
      shortlisted: count('SHORTLISTED'),
      interviews: count('INTERVIEW'),
      selected: count('SELECTED'),
      rejected: count('REJECTED'),
    }
  }, [users, jobs, applications])

  return { users, jobs, applications, stats, loading, error, reload: load }
}
