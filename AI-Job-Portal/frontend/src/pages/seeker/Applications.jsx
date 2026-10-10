import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Briefcase, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SkeletonRows } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { fetchMyApplications } from '@/store/applicationSlice'
import { fetchJobs } from '@/store/jobSlice'
import { useAiScores } from '@/hooks/useAiScores'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/utils/format'

const TAB_FILTERS = {
  all: () => true,
  active: (application) => !['REJECTED', 'SELECTED'].includes(application.status),
  shortlisted: (application) =>
    ['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(application.status),
  closed: (application) => application.status === 'REJECTED',
}

export default function Applications() {
  useDocumentTitle('Applications')

  const dispatch = useDispatch()
  const { mine, mineStatus, mineError } = useSelector((state) => state.applications)
  const jobs = useSelector((state) => state.jobs.items)

  const [tab, setTab] = useState('all')

  useEffect(() => {
    dispatch(fetchMyApplications())
    dispatch(fetchJobs())
  }, [dispatch])

  const applicationIds = useMemo(() => mine.map((a) => a.id), [mine])
  const { scores, pending } = useAiScores(applicationIds)

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs])

  const sorted = useMemo(
    () => [...mine].sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0)),
    [mine],
  )

  const rows = useMemo(() => sorted.filter(TAB_FILTERS[tab]), [sorted, tab])

  const tabs = [
    { value: 'all', label: 'All', count: sorted.length },
    { value: 'active', label: 'In progress', count: sorted.filter(TAB_FILTERS.active).length },
    {
      value: 'shortlisted',
      label: 'Shortlisted',
      count: sorted.filter(TAB_FILTERS.shortlisted).length,
    },
    { value: 'closed', label: 'Not selected', count: sorted.filter(TAB_FILTERS.closed).length },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Applications"
        description="Every role you have applied to, with the match score that went with it."
        actions={
          <Link to="/jobs">
            <Button variant="outline">Find more roles</Button>
          </Link>
        }
      />

      {mineStatus === 'failed' ? (
        <ErrorState message={mineError} onRetry={() => dispatch(fetchMyApplications())} />
      ) : mineStatus === 'succeeded' && sorted.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="You have not applied to anything yet"
          description="When you apply, the application and its resume match score appear here."
          action={
            <Link to="/jobs">
              <Button>Browse open roles</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="px-5 pt-2 sm:px-6">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">AI match</TableHead>
                  <TableHead>
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {mineStatus === 'loading' && <SkeletonRows rows={5} columns={5} />}

                {mineStatus === 'succeeded' && rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Nothing in this group yet.
                    </TableCell>
                  </TableRow>
                )}

                {mineStatus === 'succeeded' &&
                  rows.map((application) => {
                    const job = jobsById.get(application.jobId)

                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <Link
                            to={`/applications/${application.id}`}
                            className="block rounded font-medium text-foreground hover:text-primary"
                          >
                            {job?.title || `Job #${application.jobId}`}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {job?.companyName || 'Company not specified'}
                          </p>
                        </TableCell>

                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {formatDate(application.appliedAt)}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={application.status} />
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <AiScoreCell
                            score={scores[application.id]?.matchScore ?? null}
                            pending={pending}
                          />
                        </TableCell>

                        <TableCell className="text-right">
                          <Link
                            to={`/applications/${application.id}`}
                            className="inline-flex rounded p-1 text-muted-foreground hover:text-foreground"
                            aria-label={`Open application for ${job?.title || 'this role'}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
