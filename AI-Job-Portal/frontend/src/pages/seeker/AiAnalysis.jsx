import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Info, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { AiEvaluationPanel } from '@/components/ai/AiEvaluationPanel'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { StatusBadge } from '@/components/applications/StatusBadge'
import aiApi from '@/api/aiApi'
import { fetchMyApplications } from '@/store/applicationSlice'
import { fetchMyResumes, selectSortedResumes } from '@/store/resumeSlice'
import { fetchJobs } from '@/store/jobSlice'
import { useAiScores } from '@/hooks/useAiScores'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/utils/format'
import { cn } from '@/lib/utils'

export default function AiAnalysis() {
  useDocumentTitle('AI analysis')

  const dispatch = useDispatch()
  const { mine, mineStatus, mineError } = useSelector((state) => state.applications)
  const jobs = useSelector((state) => state.jobs.items)
  const resumes = useSelector(selectSortedResumes)
  const resumeStatus = useSelector((state) => state.resumes.status)

  const [tab, setTab] = useState('applications')
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [resumeAnalysisState, setResumeAnalysisState] = useState('idle')

  useEffect(() => {
    dispatch(fetchMyApplications())
    dispatch(fetchJobs())
    dispatch(fetchMyResumes())
  }, [dispatch])

  const sorted = useMemo(
    () => [...mine].sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0)),
    [mine],
  )

  const applicationIds = useMemo(() => sorted.filter((a) => a.resumeId).map((a) => a.id), [sorted])
  const { scores, pending } = useAiScores(applicationIds)

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs])

  useEffect(() => {
    if (selectedApplicationId === null && sorted.length > 0) {
      // Default to the most recent application that already has a score.
      const scored = sorted.find((a) => scores[a.id])
      setSelectedApplicationId((scored || sorted[0]).id)
    }
  }, [sorted, scores, selectedApplicationId])

  useEffect(() => {
    if (selectedResumeId === null && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  useEffect(() => {
    if (tab !== 'resumes' || !selectedResumeId) return

    let cancelled = false
    setResumeAnalysisState('loading')
    setResumeAnalysis(null)

    aiApi
      .getForResume(selectedResumeId)
      .then((result) => {
        if (cancelled) return
        setResumeAnalysis(result)
        setResumeAnalysisState('succeeded')
      })
      .catch(() => {
        if (cancelled) return
        setResumeAnalysisState('empty')
      })

    return () => {
      cancelled = true
    }
  }, [tab, selectedResumeId])

  const selectedApplication = sorted.find((a) => a.id === selectedApplicationId)
  const selectedAnalysis = selectedApplicationId ? scores[selectedApplicationId] : null

  const scoredCount = Object.values(scores).filter(Boolean).length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="AI analysis"
        description="How your resume scored against the roles you applied to."
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          A resume is scored against a specific job description when you apply to it, so
          evaluations appear here after an application, not on their own. Pick an application to
          see its full breakdown.
        </p>
      </div>

      <Tabs
        tabs={[
          { value: 'applications', label: 'By application', count: sorted.length },
          { value: 'resumes', label: 'By resume', count: resumes.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'applications' && (
        <>
          {mineStatus === 'loading' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-80 lg:col-span-1" />
              <Skeleton className="h-80 lg:col-span-2" />
            </div>
          )}

          {mineStatus === 'failed' && (
            <ErrorState message={mineError} onRetry={() => dispatch(fetchMyApplications())} />
          )}

          {mineStatus === 'succeeded' && sorted.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No analysis yet"
              description="Apply to a role with one of your resumes and the match breakdown will appear here."
              action={
                <Link to="/jobs">
                  <Button>Browse open roles</Button>
                </Link>
              }
            />
          )}

          {mineStatus === 'succeeded' && sorted.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Your applications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {pending
                      ? 'Loading scores'
                      : `${scoredCount} of ${sorted.length} scored`}
                  </p>
                </CardHeader>

                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {sorted.map((application) => {
                      const job = jobsById.get(application.jobId)
                      const active = application.id === selectedApplicationId

                      return (
                        <li key={application.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedApplicationId(application.id)}
                            aria-current={active ? 'true' : undefined}
                            className={cn(
                              'flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors sm:px-6',
                              active ? 'bg-primary-soft' : 'hover:bg-muted/60',
                            )}
                          >
                            <span className="truncate text-sm font-medium text-foreground">
                              {job?.title || `Job #${application.jobId}`}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {job?.companyName || 'Company not specified'}
                            </span>
                            <span className="flex items-center justify-between gap-2">
                              <AiScoreCell
                                score={scores[application.id]?.matchScore ?? null}
                                pending={pending && !scores[application.id]}
                              />
                              <StatusBadge status={application.status} size="sm" />
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                {selectedAnalysis ? (
                  <AiEvaluationPanel
                    analysis={selectedAnalysis}
                    title={
                      jobsById.get(selectedApplication?.jobId)?.title || 'Match breakdown'
                    }
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                      {pending ? (
                        <>
                          <Loader2
                            className="h-6 w-6 animate-spin text-primary"
                            aria-hidden="true"
                          />
                          <h2 className="text-sm font-semibold">Loading the breakdown</h2>
                        </>
                      ) : (
                        <>
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Sparkles
                              className="h-6 w-6 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </span>
                          <h2 className="text-sm font-semibold">
                            This application has no score yet
                          </h2>
                          <p className="max-w-sm text-sm text-muted-foreground">
                            Scoring runs shortly after you apply. If you applied without
                            attaching a resume, there is nothing to compare against.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'resumes' && (
        <>
          {resumeStatus === 'loading' && <Skeleton className="h-64 w-full" />}

          {resumeStatus === 'succeeded' && resumes.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No resumes uploaded"
              description="Upload a resume, then apply to a role to get it scored."
              action={
                <Link to="/resumes">
                  <Button>Upload a resume</Button>
                </Link>
              }
            />
          )}

          {resumeStatus === 'succeeded' && resumes.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Your resumes</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Shows the most recent evaluation for each file.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {resumes.map((resume) => {
                      const active = resume.id === selectedResumeId

                      return (
                        <li key={resume.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedResumeId(resume.id)}
                            aria-current={active ? 'true' : undefined}
                            className={cn(
                              'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors sm:px-6',
                              active ? 'bg-primary-soft' : 'hover:bg-muted/60',
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {resume.fileName}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {formatDate(resume.uploadedAt)}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                {resumeAnalysisState === 'loading' && <Skeleton className="h-96 w-full" />}

                {resumeAnalysisState === 'succeeded' && resumeAnalysis && (
                  <AiEvaluationPanel
                    analysis={resumeAnalysis}
                    title="Most recent evaluation of this resume"
                  />
                )}

                {resumeAnalysisState === 'empty' && (
                  <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Sparkles className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <h2 className="text-sm font-semibold">This resume has not been scored</h2>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Apply to a role with this resume and its breakdown will show up here.
                      </p>
                      <Link to="/jobs">
                        <Button variant="outline" size="sm">
                          Browse open roles
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

