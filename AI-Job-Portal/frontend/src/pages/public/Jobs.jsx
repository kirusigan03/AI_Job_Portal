import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SearchX } from 'lucide-react'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { fetchJobs, resetFilters, setFilters } from '@/store/jobSlice'
import { fetchMyApplications } from '@/store/applicationSlice'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Turns "3-5" or "5+" into a comparable lower bound in years. */
function minYears(value) {
  if (!value) return 0
  const match = String(value).match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function filterJobs(jobs, filters) {
  const query = filters.query.trim().toLowerCase()
  const location = filters.location.trim().toLowerCase()
  const salaryFloor = filters.salaryMin ? Number(filters.salaryMin) : null
  const experienceFloor = filters.experience ? minYears(filters.experience) : null

  return jobs.filter((job) => {
    if (query) {
      const haystack = [job.title, job.description, job.companyName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (location && !(job.location || '').toLowerCase().includes(location)) return false
    if (filters.jobType && job.jobType !== filters.jobType) return false
    if (filters.status && job.status !== filters.status) return false

    if (salaryFloor !== null) {
      const jobSalary = job.salaryMax ?? job.salaryMin
      if (!jobSalary || jobSalary < salaryFloor) return false
    }

    if (experienceFloor !== null && minYears(job.experienceRequired) < experienceFloor) {
      return false
    }

    return true
  })
}

export default function Jobs() {
  useDocumentTitle('Jobs')

  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, status, error, filters } = useSelector((state) => state.jobs)
  const myApplications = useSelector((state) => state.applications.mine)
  const { isAuthenticated, isJobSeeker } = useAuth()

  // The landing page hands off its search through the query string.
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    if (q || location) dispatch(setFilters({ query: q, location }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (isJobSeeker) dispatch(fetchMyApplications())
  }, [dispatch, isJobSeeker])

  const appliedJobIds = useMemo(
    () => new Set(myApplications.map((application) => application.jobId)),
    [myApplications],
  )

  const results = useMemo(() => filterJobs(items, filters), [items, filters])

  function onFilterChange(patch) {
    dispatch(setFilters(patch))

    // Keep the URL shareable as the search changes.
    const next = new URLSearchParams(searchParams)
    if ('query' in patch) {
      if (patch.query) next.set('q', patch.query)
      else next.delete('q')
    }
    if ('location' in patch) {
      if (patch.location) next.set('location', patch.location)
      else next.delete('location')
    }
    setSearchParams(next, { replace: true })
  }

  function onReset() {
    dispatch(resetFilters())
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Open roles</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every job posted on SmartJob, filtered the way you need it.
        </p>
      </div>

      <JobFilters
        filters={filters}
        onChange={onFilterChange}
        onReset={onReset}
        resultCount={status === 'succeeded' ? results.length : undefined}
      />

      <div className="mt-6">
        {status === 'loading' && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {status === 'failed' && (
          <ErrorState
            title="Could not load jobs"
            message={error}
            onRetry={() => dispatch(fetchJobs())}
          />
        )}

        {status === 'succeeded' && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="No roles match those filters"
            description="Try a broader job title, a different location, or clear the filters to see everything."
            action={
              <Button variant="outline" onClick={onReset}>
                Clear filters
              </Button>
            }
          />
        )}

        {status === 'succeeded' && results.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applied={isAuthenticated && isJobSeeker && appliedJobIds.has(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
