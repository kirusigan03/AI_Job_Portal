import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { SkeletonRows } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { StatusActions } from '@/components/applications/StatusActions'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { RecommendationBadge } from '@/components/ai/RecommendationBadge'
import { useEmployerApplications } from '@/hooks/useEmployerApplications'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APPLICATION_STATUSES } from '@/utils/constants'
import { formatDate, humanize, initialsFrom } from '@/utils/format'

function candidateName(candidate, candidateId) {
  const name = [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ')
  return name || `Candidate #${candidateId}`
}

export default function EmployerApplications() {
  useDocumentTitle('Applications')

  const { userId } = useAuth()
  const { jobs, rows, loading, error, reload, applyStatusChange } =
    useEmployerApplications(userId)

  const [tab, setTab] = useState('ALL')
  const [jobFilter, setJobFilter] = useState('')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')

  const filtered = useMemo(() => {
    let result = rows

    if (tab !== 'ALL') result = result.filter((row) => row.application.status === tab)
    if (jobFilter) result = result.filter((row) => String(row.job.id) === jobFilter)

    if (query.trim()) {
      const needle = query.trim().toLowerCase()
      result = result.filter((row) =>
        [
          candidateName(row.candidate, row.application.candidateId),
          row.candidate?.email,
          row.job.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.application.appliedAt || 0) - new Date(a.application.appliedAt || 0)
      }
      return (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0)
    })
  }, [rows, tab, jobFilter, query, sortBy])

  const tabs = [
    { value: 'ALL', label: 'All', count: rows.length },
    ...APPLICATION_STATUSES.map((status) => ({
      value: status,
      label: humanize(status),
      count: rows.filter((row) => row.application.status === status).length,
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Applications"
        description="Everyone who applied to your roles, ranked by how closely their resume matches."
        actions={
          <Link to="/employer/jobs">
            <Button variant="outline">My jobs</Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !loading && rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Once someone applies to one of your roles, they appear here with a match breakdown."
          action={
            <Link to="/employer/jobs/create">
              <Button>Post a job</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-3 sm:pt-6">
              <div>
                <Label htmlFor="search-candidates" className="mb-1.5">
                  Search
                </Label>
                <Input
                  id="search-candidates"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Candidate or role"
                />
              </div>

              <div>
                <Label htmlFor="filter-job" className="mb-1.5">
                  Role
                </Label>
                <Select
                  id="filter-job"
                  value={jobFilter}
                  onChange={(event) => setJobFilter(event.target.value)}
                >
                  <option value="">All roles</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="sort-by" className="mb-1.5">
                  Sort by
                </Label>
                <Select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="score">Highest match</option>
                  <option value="recent">Most recent</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 pt-2 sm:px-6">
              <Tabs tabs={tabs} value={tab} onChange={setTab} />
            </div>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Resume</TableHead>
                    <TableHead>AI match</TableHead>
                    <TableHead className="hidden xl:table-cell">Recommendation</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && <SkeletonRows rows={6} columns={7} />}

                  {!loading && filtered.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                        No applications match these filters.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    filtered.map(({ application, job, analysis, candidate }) => (
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
                                {formatDate(application.appliedAt)}
                              </span>
                            </span>
                          </Link>
                        </TableCell>

                        <TableCell className="hidden max-w-[12rem] truncate sm:table-cell">
                          {job.title}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          {application.resumeId ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" aria-hidden="true" />
                              Attached
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <AiScoreCell score={analysis?.matchScore ?? null} />
                        </TableCell>

                        <TableCell className="hidden xl:table-cell">
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

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            Match scores support your decision. Open a candidate to read the reasoning before
            acting on one.
          </p>
        </>
      )}
    </div>
  )
}
