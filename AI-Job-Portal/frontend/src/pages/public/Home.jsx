import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowRight,
  BarChart3,
  Building2,
  MapPin,
  Search,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JobCard } from '@/components/jobs/JobCard'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { fetchJobs } from '@/store/jobSlice'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const AI_FEATURES = [
  {
    icon: Sparkles,
    title: 'Resume analysis',
    body: 'Every resume is read against the job description it was sent to, not scored in the abstract.',
  },
  {
    icon: Target,
    title: 'Job matching',
    body: 'A match score with separate skills, experience and education breakdowns.',
  },
  {
    icon: BarChart3,
    title: 'Skill gap detection',
    body: 'See which required skills your resume covers and which ones it never mentions.',
  },
  {
    icon: UserCheck,
    title: 'Candidate evaluation',
    body: 'Recruiters get the same breakdown, with written reasoning behind the number.',
  },
]

export default function Home() {
  useDocumentTitle()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, status, error } = useSelector((state) => state.jobs)

  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (status === 'idle') dispatch(fetchJobs())
  }, [dispatch, status])

  const activeJobs = useMemo(
    () => items.filter((job) => job.status === 'ACTIVE'),
    [items],
  )

  const featured = useMemo(
    () =>
      [...activeJobs]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [activeJobs],
  )

  const companyCount = useMemo(
    () => new Set(activeJobs.map((job) => job.companyName).filter(Boolean)).size,
    [activeJobs],
  )

  function onSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/60 to-white">
        <div className="container py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
              Find your next opportunity
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover jobs, manage applications, and use AI to understand how well your resume
              matches the role.
            </p>
          </div>

          <form
            onSubmit={onSearch}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-white p-3 shadow-pop"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Label htmlFor="hero-query" className="sr-only">
                  Job title or skill
                </Label>
                <Input
                  id="hero-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title or skill"
                  className="h-12 border-0 pl-10 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="hidden w-px bg-border sm:block" />

              <div className="relative flex-1">
                <MapPin
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Label htmlFor="hero-location" className="sr-only">
                  Location
                </Label>
                <Input
                  id="hero-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or remote"
                  className="h-12 border-0 pl-10 shadow-none focus-visible:ring-0"
                />
              </div>

              <Button type="submit" size="lg" className="h-12 sm:w-32">
                Search
              </Button>
            </div>
          </form>

          <dl className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            <div>
              <dt className="text-sm text-muted-foreground">Open roles</dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {status === 'loading' ? '—' : activeJobs.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Companies hiring</dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {status === 'loading' ? '—' : companyCount}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Scored on submission</dt>
              <dd className="text-2xl font-semibold">Every resume</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">Recently posted</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The newest roles across every company on SmartJob.
            </p>
          </div>
          <Link to="/jobs">
            <Button variant="outline">
              Browse all jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          {status === 'loading' && (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {status === 'failed' && (
            <ErrorState message={error} onRetry={() => dispatch(fetchJobs())} />
          )}

          {status === 'succeeded' && featured.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No open roles yet"
              description="Once employers publish jobs they will appear here."
              action={
                <Link to="/register">
                  <Button>Post a job</Button>
                </Link>
              }
            />
          )}

          {status === 'succeeded' && featured.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI section */}
      <section className="border-y border-border bg-muted/40">
        <div className="container py-16 sm:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Make your resume work smarter
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                When you apply, SmartJob reads your resume against that specific job description
                and returns a match score you can act on. Recruiters see the same breakdown, so
                nobody is guessing.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Analyze my resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/ai-career">
                  <Button size="lg" variant="outline">
                    How scoring works
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Scores are decision support for recruiters, not an automatic hiring decision.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {AI_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-white p-5 shadow-card"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                    <feature.icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-card">
            <h2 className="text-xl font-semibold">Looking for work</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Upload a resume once, apply in two clicks, and track every application from a single
              dashboard.
            </p>
            <Link to="/register" className="mt-6 inline-block">
              <Button>Create a job seeker account</Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-foreground p-8 text-white">
            <h2 className="text-xl font-semibold">Hiring</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Post a role and see applicants ranked by how closely their resume matches it, with
              the reasoning attached.
            </p>
            <Link to="/register" className="mt-6 inline-block">
              <Button variant="secondary">Create an employer account</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
