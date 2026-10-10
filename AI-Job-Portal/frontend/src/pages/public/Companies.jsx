import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Building2, MapPin, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { fetchJobs } from '@/store/jobSlice'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * There is no company entity in the backend, so the directory is built from
 * the companyName on live job postings.
 */
function groupByCompany(jobs) {
  const map = new Map()

  jobs.forEach((job) => {
    const name = job.companyName?.trim()
    if (!name) return

    if (!map.has(name)) {
      map.set(name, { name, openRoles: 0, locations: new Set(), latest: null })
    }

    const entry = map.get(name)
    entry.openRoles += 1
    if (job.location) entry.locations.add(job.location)
    if (!entry.latest || new Date(job.createdAt || 0) > new Date(entry.latest.createdAt || 0)) {
      entry.latest = job
    }
  })

  return [...map.values()]
    .map((entry) => ({ ...entry, locations: [...entry.locations] }))
    .sort((a, b) => b.openRoles - a.openRoles)
}

export default function Companies() {
  useDocumentTitle('Companies')

  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.jobs)
  const [query, setQuery] = useState('')

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  const companies = useMemo(() => {
    const active = items.filter((job) => job.status === 'ACTIVE')
    const grouped = groupByCompany(active)

    if (!query.trim()) return grouped
    return grouped.filter((company) =>
      company.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [items, query])

  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Companies hiring
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every organisation with an open role on SmartJob right now.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Label htmlFor="company-search" className="sr-only">
            Search companies
          </Label>
          <Input
            id="company-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies"
            className="pl-9"
          />
        </div>
      </div>

      {status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {status === 'failed' && (
        <ErrorState message={error} onRetry={() => dispatch(fetchJobs())} />
      )}

      {status === 'succeeded' && companies.length === 0 && (
        <EmptyState
          icon={Building2}
          title={query ? 'No companies match that search' : 'No companies are hiring yet'}
          description={
            query
              ? 'Try a shorter search term.'
              : 'Companies appear here as soon as they publish their first role.'
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : null
          }
        />
      )}

      {status === 'succeeded' && companies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <article
              key={company.name}
              className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-card transition-colors hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-semibold text-muted-foreground">
                  {company.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{company.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {company.openRoles} open {company.openRoles === 1 ? 'role' : 'roles'}
                  </p>
                </div>
              </div>

              {company.locations.length > 0 && (
                <p className="mt-4 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-2">{company.locations.join(' · ')}</span>
                </p>
              )}

              {company.latest && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Latest: <span className="text-foreground">{company.latest.title}</span>
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                <Badge variant="outline">{company.openRoles} hiring</Badge>
                <Link to={`/jobs?q=${encodeURIComponent(company.name)}`}>
                  <Button size="sm" variant="outline">
                    View roles
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
