import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { JobStatusBadge } from '@/components/applications/StatusBadge'
import { ResumeCard } from '@/components/resume/ResumeCard'
import { clearCurrentJob, fetchJobById } from '@/store/jobSlice'
import { applyToJob, fetchMyApplications } from '@/store/applicationSlice'
import { fetchMyResumes, selectSortedResumes } from '@/store/resumeSlice'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, formatSalary, humanize } from '@/utils/format'

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const { current: job, currentStatus, currentError } = useSelector((state) => state.jobs)
  const myApplications = useSelector((state) => state.applications.mine)
  const resumes = useSelector(selectSortedResumes)
  const resumeStatus = useSelector((state) => state.resumes.status)
  const { isAuthenticated, isJobSeeker, role } = useAuth()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useDocumentTitle(job?.title)

  useEffect(() => {
    dispatch(fetchJobById(id))
    return () => dispatch(clearCurrentJob())
  }, [dispatch, id])

  useEffect(() => {
    if (isJobSeeker) {
      dispatch(fetchMyApplications())
      dispatch(fetchMyResumes())
    }
  }, [dispatch, isJobSeeker])

  const existingApplication = useMemo(
    () => myApplications.find((application) => String(application.jobId) === String(id)),
    [myApplications, id],
  )

  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      const primary = resumes.find((resume) => resume.primaryResume)
      setSelectedResumeId(primary?.id ?? resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  async function onApply() {
    setSubmitting(true)
    const result = await dispatch(
      applyToJob({ jobId: Number(id), resumeId: selectedResumeId ?? null }),
    )
    setSubmitting(false)

    if (applyToJob.fulfilled.match(result)) {
      setDialogOpen(false)
      toast.success(
        'Application submitted',
        'Your resume is being scored against this role now.',
      )
      navigate(`/applications/${result.payload.id}`)
    } else {
      toast.error('Could not apply', result.payload)
    }
  }

  function onApplyClick() {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(`/jobs/${id}`)}`)
      return
    }
    setDialogOpen(true)
  }

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return (
      <div className="container max-w-5xl py-10">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-9 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/3" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (currentStatus === 'failed') {
    return (
      <div className="container max-w-3xl py-16">
        <ErrorState
          title="Job unavailable"
          message={currentError}
          onRetry={() => dispatch(fetchJobById(id))}
        />
        <div className="mt-6 text-center">
          <Link to="/jobs">
            <Button variant="outline">Back to all jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!job) return null

  const closed = job.status === 'CLOSED'

  return (
    <div className="container max-w-5xl py-10 sm:py-12">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All jobs
      </Link>

      <header className="mt-6 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {job.jobType && <Badge variant="primary">{humanize(job.jobType)}</Badge>}
            <JobStatusBadge status={job.status} />
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            {job.title}
          </h1>

          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {job.companyName || 'Company not specified'}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {job.location}
              </span>
            )}
          </p>
        </div>

        <div className="shrink-0">
          {existingApplication ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Already applied
              </Badge>
              <Link to={`/applications/${existingApplication.id}`}>
                <Button variant="outline" size="sm">
                  View application
                </Button>
              </Link>
            </div>
          ) : closed ? (
            <Badge variant="default">This role is closed</Badge>
          ) : isAuthenticated && !isJobSeeker ? (
            <p className="max-w-[16rem] text-sm text-muted-foreground sm:text-right">
              You are signed in as {humanize(role)}. Only job seeker accounts can apply.
            </p>
          ) : (
            <Button size="lg" onClick={onApplyClick}>
              Apply for this role
            </Button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <DetailRow
                  icon={Banknote}
                  label="Salary"
                  value={formatSalary(job.salaryMin, job.salaryMax)}
                />
                <DetailRow
                  icon={Trophy}
                  label="Experience"
                  value={job.experienceRequired || 'Not specified'}
                />
                <DetailRow
                  icon={Briefcase}
                  label="Job type"
                  value={job.jobType ? humanize(job.jobType) : null}
                />
                <DetailRow icon={MapPin} label="Location" value={job.location} />
                <DetailRow
                  icon={CalendarDays}
                  label="Posted"
                  value={formatDate(job.createdAt)}
                />
              </dl>
            </CardContent>
          </Card>

          {!existingApplication && !closed && (
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <h2 className="text-sm font-semibold">Before you apply</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your resume is scored against this job description as soon as you submit. Attach
                  the version that best fits the role.
                </p>
                <Button className="mt-4 w-full" onClick={onApplyClick}>
                  Apply for this role
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Apply for this role"
        description={`Choose the resume to send with your application for ${job.title}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onApply} loading={submitting} disabled={resumes.length === 0}>
              Submit application
            </Button>
          </>
        }
      >
        {resumeStatus === 'loading' && <Skeleton className="h-20 w-full" />}

        {resumeStatus !== 'loading' && resumes.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No resume uploaded yet"
            description="Upload a PDF or DOCX first so it can be scored against this role."
            action={
              <Link to="/resumes">
                <Button>Upload a resume</Button>
              </Link>
            }
          />
        )}

        {resumes.length > 0 && (
          <div className="space-y-2">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                selectable
                selected={selectedResumeId === resume.id}
                onSelect={(next) => setSelectedResumeId(next.id)}
              />
            ))}
          </div>
        )}
      </Dialog>
    </div>
  )
}
