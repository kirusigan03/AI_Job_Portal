import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { StatusActions } from '@/components/applications/StatusActions'
import { AiEvaluationPanel } from '@/components/ai/AiEvaluationPanel'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { useEmployerApplications } from '@/hooks/useEmployerApplications'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import resumeApi from '@/api/resumeApi'
import { formatDate, formatDateTime } from '@/utils/format'
import { cn } from '@/lib/utils'

export default function CandidateDetail() {
  const { id } = useParams()
  const { userId } = useAuth()

  const { rows, loading, error, reload, applyStatusChange } = useEmployerApplications(userId)

  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [resume, setResume] = useState(null)

  // Only applications to this employer's own jobs are shown, even though the
  // backend would return the candidate's applications elsewhere too.
  const candidateRows = useMemo(
    () => rows.filter((row) => String(row.application.candidateId) === String(id)),
    [rows, id],
  )

  const candidate = candidateRows[0]?.candidate || null

  const displayName =
    [candidate?.firstName, candidate?.lastName].filter(Boolean).join(' ') || `Candidate #${id}`

  useDocumentTitle(displayName)

  useEffect(() => {
    if (!selectedApplicationId && candidateRows.length > 0) {
      const best = [...candidateRows].sort(
        (a, b) => (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0),
      )[0]
      setSelectedApplicationId(best.application.id)
    }
  }, [candidateRows, selectedApplicationId])

  const selected = candidateRows.find((row) => row.application.id === selectedApplicationId)

  useEffect(() => {
    const resumeId = selected?.application?.resumeId
    if (!resumeId) {
      setResume(null)
      return
    }

    let cancelled = false
    resumeApi
      .getById(resumeId)
      .then((result) => !cancelled && setResume(result))
      .catch(() => !cancelled && setResume(null))

    return () => {
      cancelled = true
    }
  }, [selected?.application?.resumeId])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  if (candidateRows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/employer/candidates"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Candidates
        </Link>
        <EmptyState
          icon={FileText}
          title="No applications from this candidate"
          description="You can only review candidates who have applied to one of your roles."
          action={
            <Link to="/employer/candidates">
              <Button>Back to candidates</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/employer/candidates"
        className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Candidates
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-start sm:pt-6">
          <Avatar
            size="xl"
            src={candidate?.profileImageUrl}
            name={displayName}
            initials={
              (candidate?.firstName?.[0] || '') + (candidate?.lastName?.[0] || '') || 'C'
            }
          />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-[-0.02em]">{displayName}</h1>

            <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {candidate?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <dd>
                    <a href={`mailto:${candidate.email}`} className="rounded hover:text-foreground">
                      {candidate.email}
                    </a>
                  </dd>
                </div>
              )}
              {candidate?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <dd>{candidate.phone}</dd>
                </div>
              )}
              {candidate?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <dd>{candidate.location}</dd>
                </div>
              )}
            </dl>

            {candidate?.bio && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {candidate.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {candidate?.linkedinUrl && (
                <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer noopener">
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </a>
              )}
              {candidate?.githubUrl && (
                <a href={candidate.githubUrl} target="_blank" rel="noreferrer noopener">
                  <Button variant="outline" size="sm">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              )}
            </div>

            {!candidate && (
              <p className="mt-3 text-sm text-muted-foreground">
                This candidate has not filled in a profile yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {candidateRows.length > 1 && (
        <Tabs
          tabs={candidateRows.map((row) => ({
            value: String(row.application.id),
            label: row.job.title,
          }))}
          value={String(selectedApplicationId)}
          onChange={(value) => setSelectedApplicationId(Number(value))}
        />
      )}

      {selected && (
        <>
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <CardTitle>{selected.job.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Applied {formatDate(selected.application.appliedAt)} · Last updated{' '}
                  {formatDateTime(selected.application.updatedAt)}
                </p>
              </div>
              <StatusBadge status={selected.application.status} />
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {resume?.fileName ||
                      (selected.application.resumeId
                        ? 'Resume unavailable'
                        : 'No resume attached')}
                  </p>
                  {resume && (
                    <p className="text-xs text-muted-foreground">
                      {resume.fileType?.toUpperCase() || 'FILE'} · Uploaded{' '}
                      {formatDate(resume.uploadedAt)}
                    </p>
                  )}
                </div>
                <AiScoreCell score={selected.analysis?.matchScore ?? null} />
              </div>

              <div>
                <h2 className="text-sm font-medium text-foreground">Move this candidate</h2>
                <div className="mt-3">
                  <StatusActions
                    application={selected.application}
                    variant="buttons"
                    onUpdated={applyStatusChange}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  The candidate is notified when their status changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {selected.analysis ? (
            <AiEvaluationPanel
              analysis={selected.analysis}
              title="Resume match for this role"
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold">No match score for this application</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Either the evaluation has not finished yet, or the candidate applied without
                  attaching a resume. Review the application on its own merits.
                </p>
              </CardContent>
            </Card>
          )}

          {resume?.extractedText && (
            <Card>
              <CardHeader>
                <CardTitle>Resume text</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Extracted on upload and used for the match comparison.
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'max-h-96 overflow-y-auto rounded-lg border border-border bg-muted/40 p-4 scrollbar-thin',
                  )}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {resume.extractedText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
