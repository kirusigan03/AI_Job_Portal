import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Briefcase,
  ExternalLink,
  MoreHorizontal,
  PlusCircle,
  Settings2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/dropdown'
import { SkeletonRows } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { JobStatusBadge } from '@/components/applications/StatusBadge'
import { deleteJob, fetchEmployerJobs, updateJobStatus } from '@/store/jobSlice'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { JOB_STATUSES } from '@/utils/constants'
import { formatDate, formatSalary, humanize } from '@/utils/format'

export default function EmployerJobs() {
  useDocumentTitle('My jobs')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { userId } = useAuth()

  const { employerJobs, employerStatus, employerError } = useSelector((state) => state.jobs)

  const [tab, setTab] = useState('ALL')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (userId) dispatch(fetchEmployerJobs(userId))
  }, [dispatch, userId])

  const sorted = useMemo(
    () =>
      [...employerJobs].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [employerJobs],
  )

  const rows = useMemo(
    () => (tab === 'ALL' ? sorted : sorted.filter((job) => job.status === tab)),
    [sorted, tab],
  )

  const tabs = [
    { value: 'ALL', label: 'All', count: sorted.length },
    ...JOB_STATUSES.map((status) => ({
      value: status,
      label: humanize(status),
      count: sorted.filter((job) => job.status === status).length,
    })),
  ]

  async function onStatusChange(job, status) {
    const result = await dispatch(updateJobStatus({ id: job.id, status }))

    if (updateJobStatus.fulfilled.match(result)) {
      toast.success('Job updated', `${job.title} is now ${humanize(status).toLowerCase()}.`)
    } else {
      toast.error('Could not update the job', result.payload)
    }
  }

  async function onConfirmDelete() {
    setDeleting(true)
    const result = await dispatch(deleteJob(pendingDelete.id))
    setDeleting(false)

    if (deleteJob.fulfilled.match(result)) {
      toast.success('Job deleted', `${pendingDelete.title} was removed.`)
      setPendingDelete(null)
    } else {
      toast.error('Could not delete the job', result.payload)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="My jobs"
        description="Every role you have posted, and how each one is doing."
        actions={
          <Link to="/employer/jobs/create">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Post a job
            </Button>
          </Link>
        }
      />

      {employerStatus === 'failed' ? (
        <ErrorState message={employerError} onRetry={() => dispatch(fetchEmployerJobs(userId))} />
      ) : employerStatus === 'succeeded' && sorted.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="You have not posted a job yet"
          description="Publish your first role and candidates can start applying straight away."
          action={
            <Link to="/employer/jobs/create">
              <Button>Post a job</Button>
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
                  <TableHead className="hidden md:table-cell">Salary</TableHead>
                  <TableHead className="hidden sm:table-cell">Posted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employerStatus === 'loading' && <SkeletonRows rows={4} columns={5} />}

                {employerStatus === 'succeeded' && rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No jobs with this status.
                    </TableCell>
                  </TableRow>
                )}

                {employerStatus === 'succeeded' &&
                  rows.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Link
                          to={`/employer/jobs/${job.id}/edit`}
                          className="block rounded font-medium hover:text-primary"
                        >
                          {job.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {job.location || 'Location not specified'}
                          {job.jobType ? ` · ${humanize(job.jobType)}` : ''}
                        </p>
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                        {formatDate(job.createdAt)}
                      </TableCell>

                      <TableCell>
                        <JobStatusBadge status={job.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Job actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownItem
                            icon={Settings2}
                            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                          >
                            Manage job
                          </DropdownItem>
                          <DropdownItem
                            icon={ExternalLink}
                            onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                          >
                            View public page
                          </DropdownItem>

                          <DropdownSeparator />
                          <DropdownLabel>Set status</DropdownLabel>
                          {JOB_STATUSES.map((status) => (
                            <DropdownItem
                              key={status}
                              disabled={job.status === status}
                              onClick={() => onStatusChange(job, status)}
                            >
                              {humanize(status)}
                            </DropdownItem>
                          ))}

                          <DropdownSeparator />
                          <DropdownItem
                            icon={Trash2}
                            destructive
                            onClick={() => setPendingDelete(job)}
                          >
                            Delete job
                          </DropdownItem>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this job?"
        description={
          pendingDelete
            ? `${pendingDelete.title} will be removed from the job board. Closing it instead keeps the posting and its applications.`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Keep it
            </Button>
            <Button variant="destructive" loading={deleting} onClick={onConfirmDelete}>
              Delete job
            </Button>
          </>
        }
      />
    </div>
  )
}
