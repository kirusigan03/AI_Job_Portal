import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  FileText,
  Search,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SkeletonCard, SkeletonStat } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { StatCard } from '@/components/layout/StatCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { JobCard } from '@/components/jobs/JobCard'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { fetchJobs } from '@/store/jobSlice'
import { fetchMyApplications } from '@/store/applicationSlice'
import { fetchMyResumes } from '@/store/resumeSlice'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, greeting } from '@/utils/format'

const PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'location',
  'bio',
  'githubUrl',
  'linkedinUrl',
  'profileImageUrl',
]

function profileCompletion(profile, resumeCount) {
  if (!profile) return { percent: resumeCount > 0 ? 10 : 0, missing: ['Add your profile details'] }

  const filled = PROFILE_FIELDS.filter((field) => Boolean(profile[field]?.toString().trim()))
  const missing = []

  if (!profile.firstName || !profile.lastName) missing.push('Add your name')
  if (!profile.location) missing.push('Add your location')
  if (!profile.bio) missing.push('Write a short bio')
  if (!profile.linkedinUrl && !profile.githubUrl) missing.push('Link a profile')
  if (resumeCount === 0) missing.push('Upload a resume')

  // Resumes count as much as the profile fields, since they gate applying.
  const total = PROFILE_FIELDS.length + 1
  const score = filled.length + (resumeCount > 0 ? 1 : 0)

  return { percent: Math.round((score / total) * 100), missing }
}

export default function Dashboard() {
  useDocumentTitle('Dashboard')

  const dispatch = useDispatch()
  const { profile, email } = useAuth()

  const { mine, mineStatus, mineError } = useSelector((state) => state.applications)
  const { items: jobs, status: jobStatus } = useSelector((state) => state.jobs)
  const resumes = useSelector((state) => state.resumes.items)

  useEffect(() => {
    dispatch(fetchMyApplications())
    dispatch(fetchJobs())
    dispatch(fetchMyResumes())
  }, [dispatch])

  const stats = useMemo(() => {
    const byStatus = (status) => mine.filter((a) => a.status === status).length

    return {
      total: mine.length,
      underReview: byStatus('UNDER_REVIEW'),
      shortlisted: byStatus('SHORTLISTED'),
      interviews: byStatus('INTERVIEW'),
    }
  }, [mine])

  const appliedJobIds = useMemo(() => new Set(mine.map((a) => a.jobId)), [mine])

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs])

  const recommended = useMemo(
    () =>
      jobs
        .filter((job) => job.status === 'ACTIVE' && !appliedJobIds.has(job.id))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4),
    [jobs, appliedJobIds],
  )

  const recent = useMemo(
    () =>
      [...mine]
        .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
        .slice(0, 5),
    [mine],
  )

  const completion = profileCompletion(profile, resumes.length)
  const firstName = profile?.firstName || email?.split('@')[0] || 'there'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName} 👋`}
        description="Here is where your search stands today."
        actions={
          <Link to="/jobs">
            <Button>
              <Search className="h-4 w-4" />
              Find jobs
            </Button>
          </Link>
        }
      />

      {completion.percent < 100 && (
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold">Complete your profile</h2>
                  <span className="text-sm font-semibold tabular-nums text-primary">
                    {completion.percent}%
                  </span>
                </div>
                <Progress
                  value={completion.percent}
                  className="mt-3"
                  label="Profile completion"
                />
                {completion.missing.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Next: {completion.missing.slice(0, 2).join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {resumes.length === 0 ? (
                  <Link to="/resumes">
                    <Button size="sm">Upload a resume</Button>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <Button size="sm">Update profile</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section aria-label="Your application statistics">
        {mineStatus === 'loading' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonStat key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Applications"
              value={stats.total}
              icon={Briefcase}
              tone="primary"
            />
            <StatCard
              label="Under review"
              value={stats.underReview}
              icon={FileText}
              tone="neutral"
            />
            <StatCard
              label="Shortlisted"
              value={stats.shortlisted}
              icon={UserCheck}
              tone="success"
            />
            <StatCard
              label="Interviews"
              value={stats.interviews}
              icon={CalendarCheck}
              tone="warning"
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent applications</CardTitle>
              <Link to="/applications">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {mineStatus === 'loading' && (
                <div className="space-y-3 p-5 sm:p-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              )}

              {mineStatus === 'failed' && (
                <div className="p-5 sm:p-6">
                  <ErrorState
                    message={mineError}
                    onRetry={() => dispatch(fetchMyApplications())}
                  />
                </div>
              )}

              {mineStatus === 'succeeded' && recent.length === 0 && (
                <div className="p-5 sm:p-6">
                  <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Apply to a role and it will show up here with its match score."
                    action={
                      <Link to="/jobs">
                        <Button>Browse open roles</Button>
                      </Link>
                    }
                  />
                </div>
              )}

              {mineStatus === 'succeeded' && recent.length > 0 && (
                <ul className="divide-y divide-border">
                  {recent.map((application) => {
                    const job = jobsById.get(application.jobId)

                    return (
                      <li key={application.id}>
                        <Link
                          to={`/applications/${application.id}`}
                          className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60 sm:px-6"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                            {(job?.companyName || 'JB').slice(0, 2).toUpperCase()}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {job?.title || `Job #${application.jobId}`}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {job?.companyName || 'Company not specified'} · Applied{' '}
                              {formatDate(application.appliedAt)}
                            </p>
                          </div>

                          <StatusBadge status={application.status} />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recommended for you</CardTitle>
              <Link to="/jobs">
                <Button variant="ghost" size="sm">
                  More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-3">
              {jobStatus === 'loading' &&
                Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} />)}

              {jobStatus === 'succeeded' && recommended.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  You have applied to every open role. Check back as new ones are posted.
                </p>
              )}

              {jobStatus === 'succeeded' &&
                recommended.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block rounded-lg border border-border p-4 transition-colors hover:border-slate-300 hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {job.companyName || 'Company not specified'}
                      {job.location ? ` · ${job.location}` : ''}
                    </p>
                  </Link>
                ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <Card className="border-primary/20 bg-primary-soft/40">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <Sparkles className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">See how your resume scored</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every application gets a match breakdown with the skills you are missing.
              </p>
            </div>
          </div>
          <Link to="/ai-analysis" className="shrink-0">
            <Button variant="outline">Open AI analysis</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
