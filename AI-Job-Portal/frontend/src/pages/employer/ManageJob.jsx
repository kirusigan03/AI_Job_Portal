import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AlertTriangle, ArrowLeft, ExternalLink, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { JobStatusBadge, StatusBadge } from '@/components/applications/StatusBadge'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import jobApi from '@/api/jobApi'
import applicationApi from '@/api/applicationApi'
import aiApi from '@/api/aiApi'
import userApi from '@/api/userApi'
import { deleteJob, updateJobStatus } from '@/store/jobSlice'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { JOB_STATUSES } from '@/utils/constants'
import { formatDate, formatSalary, humanize, initialsFrom } from '@/utils/format'

export default function ManageJob() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: job, setData: setJob, loading, error, reload } = useAsync(
    () => jobApi.getById(id),
    [id],
    { fallbackMessage: 'Could not load this job.' },
  )

  const [applicants, setApplicants] = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useDocumentTitle(job?.title || 'Manage job')

  useEffect(() => {
    if (job?.status) setStatus(job.status)
  }, [job?.status])

  useEffect(() => {
    let cancelled = false
    setApplicantsLoading(true)

    applicationApi
      .getByJob(id)
      .then(async (applications) => {
        const enriched = await Promise.all(
          applications.map(async (application) => {
            const [analysis, candidate] = await Promise.all([
              aiApi.getForApplication(application.id).catch(() => null),
              userApi.getProfile(application.candidateId).catch(() => null),
            ])
            return { application, analysis, candidate }
          }),
        )

        if (!cancelled) setApplicants(enriched)
      })
      .catch(() => {
        if (!cancelled) setApplicants([])
      })
      .finally(() => {
        if (!cancelled) setApplicantsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const ranked = useMemo(
    () =>
      [...applicants].sort(
        (a, b) => (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0),
      ),
    [applicants],
  )

  async function onSaveStatus() {
    setSavingStatus(true)
    const result = await dispatch(updateJobStatus({ id: Number(id), status }))
    setSavingStatus(false)

    if (updateJobStatus.fulfilled.match(result)) {
      setJob(result.payload)
      toast.success('Status updated', `This role is now ${humanize(status).toLowerCase()}.`)
    } else {
      toast.error('Could not update the status', result.payload)
    }
  }

  async function onDelete() {
    setDeleting(true)
    const result = await dispatch(deleteJob(Number(id)))
    setDeleting(false)

    if (deleteJob.fulfilled.match(result)) {
      toast.success('Job deleted', `${job.title} was removed.`)
      navigate('/employer/jobs')
    } else {
      toast.error('Could not delete the job', result.payload)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState title="Job unavailable" message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/employer/jobs"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        My jobs
      </Link>

      <PageHeader
        title={job.title}
        description={`${job.companyName || 'Company not specified'} · Posted ${formatDate(job.createdAt)}`}
        actions={
          <>
            <JobStatusBadge status={job.status} />
            <Link to={`/jobs/${job.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                Public page
              </Button>
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Location</dt>
              <dd className="mt-0.5 text-sm font-medium">{job.location || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Job type</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {job.jobType ? humanize(job.jobType) : 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Salary</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Experience</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {job.experienceRequired || 'Not specified'}
              </dd>
            </div>
          </dl>

          <p className="whitespace-pre-line border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-warning-soft p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Job text cannot be edited after posting
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            job-service exposes create, status and delete only, with no endpoint for updating
            the fields on a posting. To change the wording, close this role and post a
            replacement.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="job-status" className="mb-1.5">
                Current status
              </Label>
              <Select
                id="job-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {JOB_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {humanize(value)}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              onClick={onSaveStatus}
              loading={savingStatus}
              disabled={status === job.status}
              className="sm:w-40"
            >
              Save status
            </Button>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Closing a role hides it from the job board but keeps the applications you already
            received.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            Applicants{applicants.length > 0 ? ` (${applicants.length})` : ''}
          </CardTitle>
          <Link to="/employer/applications">
            <Button variant="ghost" size="sm">
              All applications
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {applicantsLoading && (
            <div className="space-y-3 p-5 sm:p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!applicantsLoading && ranked.length === 0 && (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={Users}
                title="No applications yet"
                description="Candidates who apply to this role will appear here, ranked by resume match."
              />
            </div>
          )}

          {!applicantsLoading && ranked.length > 0 && (
            <ul className="divide-y divide-border">
              {ranked.map(({ application, analysis, candidate }) => (
                <li key={application.id}>
                  <Link
                    to={`/employer/candidates/${application.candidateId}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60 sm:px-6"
                  >
                    <Avatar
                      size="sm"
                      src={candidate?.profileImageUrl}
                      initials={initialsFrom(candidate?.firstName, candidate?.lastName) || 'C'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {[candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ') ||
                          `Candidate #${application.candidateId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <AiScoreCell score={analysis?.matchScore ?? null} />
                    <StatusBadge status={application.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle>Delete this job</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deleting removes the posting permanently. If you only want to stop receiving
            applications, set the status to closed instead.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete job
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this job?"
        description={`${job.title} will be removed from the job board permanently.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="destructive" loading={deleting} onClick={onDelete}>
              Delete job
            </Button>
          </>
        }
      />
    </div>
  )
}
