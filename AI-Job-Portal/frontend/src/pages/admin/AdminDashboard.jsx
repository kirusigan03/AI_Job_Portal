import { Link } from 'react-router-dom'
import { Briefcase, CheckCircle2, FileText, Info, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SkeletonStat } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { useAdminData } from '@/hooks/useAdminData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APPLICATION_STATUSES } from '@/utils/constants'
import { formatDate, humanize } from '@/utils/format'

export default function AdminDashboard() {
  useDocumentTitle('Admin')

  const { jobs, applications, stats, loading, error, reload } = useAdminData()

  const recent = [...applications]
    .sort((a, b) => new Date(b.application.appliedAt || 0) - new Date(a.application.appliedAt || 0))
    .slice(0, 6)

  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((row) => row.application.status === status).length,
  }))

  const maxStatusCount = Math.max(1, ...byStatus.map((entry) => entry.count))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Platform overview"
        description="Users, jobs and applications across SmartJob."
        actions={
          <Button variant="outline" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <section aria-label="System statistics">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonStat key={index} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="User profiles"
                  value={stats.users}
                  icon={Users}
                  tone="primary"
                />
                <StatCard
                  label="Jobs posted"
                  value={stats.jobs}
                  icon={Briefcase}
                  tone="neutral"
                  hint={`${stats.activeJobs} active`}
                />
                <StatCard
                  label="Applications"
                  value={stats.applications}
                  icon={FileText}
                  tone="neutral"
                />
                <StatCard
                  label="Candidates selected"
                  value={stats.selected}
                  icon={CheckCircle2}
                  tone="success"
                />
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applications by status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {byStatus.map((entry) => (
                  <div key={entry.status}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">
                        {humanize(entry.status)}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{entry.count}</span>
                    </div>
                    <Progress
                      value={(entry.count / maxStatusCount) * 100}
                      label={humanize(entry.status)}
                      tone={
                        entry.status === 'SELECTED'
                          ? 'success'
                          : entry.status === 'REJECTED'
                            ? 'destructive'
                            : 'primary'
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jobs by status</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">Active</dt>
                    <dd className="text-sm font-semibold tabular-nums">{stats.activeJobs}</dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-muted-foreground">Closed</dt>
                    <dd className="text-sm font-semibold tabular-nums">{stats.closedJobs}</dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-muted-foreground">Draft</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {jobs.filter((job) => job.status === 'DRAFT').length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3 last:pb-0">
                    <dt className="text-sm text-muted-foreground">
                      Average applications per job
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {jobs.length === 0
                        ? '0'
                        : (applications.length / jobs.length).toFixed(1)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/admin/jobs">
                    <Button variant="outline" size="sm">
                      Manage jobs
                    </Button>
                  </Link>
                  <Link to="/admin/users">
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4" />
                      View users
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Latest applications</CardTitle>
              <Link to="/admin/applications">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {!loading && recent.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No applications on the platform yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map(({ application, job }) => (
                    <li
                      key={application.id}
                      className="flex items-center gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{job.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Candidate #{application.candidateId} ·{' '}
                          {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              These figures are assembled from the user, job and application services. A person
              who registered but never completed a profile is not counted in user profiles.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
