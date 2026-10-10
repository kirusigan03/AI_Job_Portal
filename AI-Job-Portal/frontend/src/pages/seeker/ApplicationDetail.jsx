import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, FileText, Loader2, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { ApplicationTimeline } from '@/components/applications/ApplicationTimeline'
import { AiEvaluationPanel } from '@/components/ai/AiEvaluationPanel'
import applicationApi from '@/api/applicationApi'
import jobApi from '@/api/jobApi'
import resumeApi from '@/api/resumeApi'
import aiApi from '@/api/aiApi'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, formatSalary, humanize } from '@/utils/format'

export default function ApplicationDetail() {
  const { id } = useParams()

  const {
    data: application,
    loading,
    error,
    reload,
  } = useAsync(() => applicationApi.getById(id), [id], {
    fallbackMessage: 'Could not load this application.',
  })

  const [job, setJob] = useState(null)
  const [resume, setResume] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysisPending, setAnalysisPending] = useState(true)

  useDocumentTitle(job?.title || 'Application')

  useEffect(() => {
    if (!application) return

    jobApi
      .getById(application.jobId)
      .then(setJob)
      .catch(() => setJob(null))

    if (application.resumeId) {
      resumeApi
        .getById(application.resumeId)
        .then(setResume)
        .catch(() => setResume(null))
    }
  }, [application])

  // Evaluations arrive asynchronously, so a missing result is polled for a
  // short while before the page settles on "not scored".
  useEffect(() => {
    if (!application?.id || !application.resumeId) {
      setAnalysisPending(false)
      return undefined
    }

    let cancelled = false
    let attempts = 0
    setAnalysisPending(true)

    async function poll() {
      try {
        const result = await aiApi.getForApplication(application.id)
        if (cancelled) return
        if (!result) {
          attempts += 1
          if (attempts >= 5) {
            setAnalysisPending(false)
            return
          }
          setTimeout(poll, 4000)
          return
        }
        setAnalysis(result)
        setAnalysisPending(false)
      } catch {
        attempts += 1
        if (cancelled) return

        if (attempts >= 5) {
          setAnalysisPending(false)
          return
        }
        setTimeout(poll, 4000)
      }
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [application?.id, application?.resumeId])
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState title="Application unavailable" message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/applications">
            <Button variant="outline">Back to applications</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/applications"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All applications
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {job?.title || `Job #${application.jobId}`}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {job?.companyName || 'Company not specified'}
            </span>
            {job?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {job.location}
              </span>
            )}
            <span>Applied {formatDate(application.appliedAt)}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={application.status} />
          {job && (
            <Link to={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                View role
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {analysisPending && !analysis && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Scoring your resume</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Your resume is being read against this job description. This usually takes a
                  few moments.
                </p>
              </CardContent>
            </Card>
          )}

          {!analysisPending && !analysis && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold">No match score for this application</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  A score is produced when a resume is attached and the evaluation finishes. If
                  you applied without a resume, there is nothing to compare against.
                </p>
              </CardContent>
            </Card>
          )}

          {analysis && <AiEvaluationPanel analysis={analysis} title="Your match for this role" />}

          {job && (
            <Card>
              <CardHeader>
                <CardTitle>Job information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Salary</dt>
                    <dd className="mt-0.5 text-sm font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Job type</dt>
                    <dd className="mt-0.5 text-sm font-medium">
                      {job.jobType ? humanize(job.jobType) : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Experience</dt>
                    <dd className="mt-0.5 text-sm font-medium">
                      {job.experienceRequired || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Posted</dt>
                    <dd className="mt-0.5 text-sm font-medium">{formatDate(job.createdAt)}</dd>
                  </div>
                </dl>

                <p className="whitespace-pre-line border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline
                status={application.status}
                appliedAt={application.appliedAt}
                updatedAt={application.updatedAt}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume sent</CardTitle>
            </CardHeader>
            <CardContent>
              {resume ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resume.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {application.resumeId
                    ? 'This resume is no longer available.'
                    : 'No resume was attached to this application.'}
                </p>
              )}

              <Link to="/resumes" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Manage resumes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}




