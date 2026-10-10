import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { AiScoreCell } from '@/components/ai/AiScoreCell'
import { RecommendationBadge } from '@/components/ai/RecommendationBadge'
import { useEmployerApplications } from '@/hooks/useEmployerApplications'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { initialsFrom } from '@/utils/format'

/** One row per person, even if they applied to several of your roles. */
function groupByCandidate(rows) {
  const map = new Map()

  rows.forEach((row) => {
    const id = row.application.candidateId

    if (!map.has(id)) {
      map.set(id, {
        candidateId: id,
        candidate: row.candidate,
        applications: [],
        bestScore: null,
        bestRecommendation: null,
      })
    }

    const entry = map.get(id)
    entry.applications.push(row)

    const score = row.analysis?.matchScore
    if (score != null && (entry.bestScore == null || score > entry.bestScore)) {
      entry.bestScore = score
      entry.bestRecommendation = row.analysis?.recommendation || null
    }
  })

  return [...map.values()].sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
}

export default function Candidates() {
  useDocumentTitle('Candidates')

  const { userId } = useAuth()
  const { rows, loading, error, reload } = useEmployerApplications(userId)
  const [query, setQuery] = useState('')

  const candidates = useMemo(() => {
    const grouped = groupByCandidate(rows)
    if (!query.trim()) return grouped

    const needle = query.trim().toLowerCase()
    return grouped.filter((entry) =>
      [entry.candidate?.firstName, entry.candidate?.lastName, entry.candidate?.location]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [rows, query])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Candidates"
        description="Everyone who has applied to one of your roles."
        actions={
          <Link to="/employer/applications">
            <Button variant="outline">View applications</Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Label htmlFor="candidate-search" className="sr-only">
              Search candidates
            </Label>
            <Input
              id="candidate-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidates"
              className="pl-9"
            />
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <EmptyState
              icon={Users}
              title={query ? 'No candidates match that search' : 'No candidates yet'}
              description={
                query
                  ? 'Try a shorter search term.'
                  : 'Candidates appear here as soon as someone applies to one of your roles.'
              }
              action={
                query ? (
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                ) : (
                  <Link to="/employer/jobs/create">
                    <Button>Post a job</Button>
                  </Link>
                )
              }
            />
          )}

          {!loading && candidates.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((entry) => (
                <Card key={entry.candidateId}>
                  <CardContent className="pt-5 sm:pt-6">
                    <Link
                      to={`/employer/candidates/${entry.candidateId}`}
                      className="flex items-center gap-3 rounded"
                    >
                      <Avatar
                        src={entry.candidate?.profileImageUrl}
                        initials={
                          initialsFrom(
                            entry.candidate?.firstName,
                            entry.candidate?.lastName,
                          ) || 'C'
                        }
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium hover:text-primary">
                          {[entry.candidate?.firstName, entry.candidate?.lastName]
                            .filter(Boolean)
                            .join(' ') || `Candidate #${entry.candidateId}`}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {entry.candidate?.location || 'Location not shared'}
                        </span>
                      </span>
                    </Link>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <AiScoreCell score={entry.bestScore} />
                      <RecommendationBadge recommendation={entry.bestRecommendation} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                      <Badge variant="outline">
                        {entry.applications.length}{' '}
                        {entry.applications.length === 1 ? 'application' : 'applications'}
                      </Badge>
                      <Link to={`/employer/candidates/${entry.candidateId}`}>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
