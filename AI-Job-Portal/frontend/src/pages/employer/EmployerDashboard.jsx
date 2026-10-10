import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, CalendarCheck, FileText, PlusCircle, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { SkeletonRows, SkeletonStat } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { StatusActions } from '@/components/applications/StatusActions'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { RecommendationBadge } from '@/components/ai/RecommendationBadge'
import { useEmployerApplications } from '@/hooks/useEmployerApplications'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, greeting, initialsFrom } from '@/utils/format'

function candidateName(candidate, candidateId) {
  const name = [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ')
  return name || candidate?.email || `Candidate #${candidateId}`
}

export default function EmployerDashboard() {
  useDocumentTitle('Employer dashboard')

  const { userId, profile, email } = useAuth()
  const { rows, stats, loading, error, reload, applyStatusChange } =
    useEmployerApplications(userId)

  const recent = useMemo(
    () =>
      [...rows]
        .sort(
          (a, b) =>
            new Date(b.application.appliedAt || 0) - new Date(a.application.appliedAt || 0),
        )
        .slice(0, 5),
    [rows],
  )

  // The ranking table is the point of the AI: highest match first.
  const ranked = useMemo(
    () =>
      [...rows]
        .filter((row) => row.analysis)
        .sort((a, b) => (b.analysis.matchScore || 0) - (a.analysis.matchScore || 0))
        .slice(0, 8),
    [rows],
  )

  const firstName = profile?.firstName || email?.split('@')[0] || 'there'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Your open roles and the candidates who applied to them."
        actions={
          <Link to="/employer/jobs/create">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Post a job
            </Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <section aria-label="Hiring statistics">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonStat key={index} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Active jobs"
                  value={stats.activeJobs}
                  icon={Briefcase}
                  tone="primary"
                  hint={`${stats.totalJobs} posted in total`}
                />
                <StatCard
                  label="Total applications"
                  value={stats.applications}
                  icon={FileText}
                  tone="neutral"
                  hint={stats.newApplications > 0 ? `${stats.newApplications} new` : undefined}
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

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Candidate ranking</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sorted by resume match. Review the resume before acting on a score.
                </p>
              </div>
              <Link to="/employer/candidates">
                <Button variant="ghost" size="sm">
                  All candidates
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead>AI match</TableHead>
                    <TableHead className="hidden lg:table-cell">Recommendation</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && <SkeletonRows rows={5} columns={6} />}

                  {!loading && ranked.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="p-0">
                        <EmptyState
                          className="border-0"
                          icon={Users}
                          title="No scored candidates yet"
                          description="Once someone applies to one of your roles, their match breakdown appears here."
                          action={
                            <Link to="/employer/jobs/create">
                              <Button>Post a job</Button>
                            </Link>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    ranked.map(({ application, job, analysis, candidate }) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <Link
                            to={`/employer/candidates/${application.candidateId}`}
                            className="flex items-center gap-3 rounded"
                          >
                            <Avatar
                              size="sm"
                              src={candidate?.profileImageUrl}
                              initials={
                                initialsFrom(candidate?.firstName, candidate?.lastName) || 'C'
                              }
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium hover:text-primary">
                                {candidateName(candidate, application.candidateId)}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                Applied {formatDate(application.appliedAt)}
                              </span>
                            </span>
                          </Link>
                        </TableCell>

                        <TableCell className="hidden max-w-[14rem] truncate sm:table-cell">
                          {job.title}
                        </TableCell>

                        <TableCell>
                          <AiScoreCell score={analysis?.matchScore ?? null} />
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          <RecommendationBadge recommendation={analysis?.recommendation} />
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <StatusBadge status={application.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <StatusActions
                            application={application}
                            onUpdated={applyStatusChange}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent applications</CardTitle>
              <Link to="/employer/applications">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {!loading && recent.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No applications yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {loading
                    ? null
                    : recent.map(({ application, job, candidate }) => (
                        <li key={application.id}>
                          <Link
                            to={`/employer/candidates/${application.candidateId}`}
                            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60 sm:px-6"
                          >
                            <Avatar
                              size="sm"
                              src={candidate?.profileImageUrl}
                              initials={
                                initialsFrom(candidate?.firstName, candidate?.lastName) || 'C'
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {candidateName(candidate, application.candidateId)}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {job.title} · {formatDate(application.appliedAt)}
                              </p>
                            </div>
                            <StatusBadge status={application.status} />
                          </Link>
                        </li>
                      ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
