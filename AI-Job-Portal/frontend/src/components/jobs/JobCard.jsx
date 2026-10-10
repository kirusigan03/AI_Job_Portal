import { Link } from 'react-router-dom'
import { Banknote, Briefcase, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobStatusBadge } from '@/components/applications/StatusBadge'
import { formatSalary, humanize, timeAgo } from '@/utils/format'

export function JobCard({ job, applied = false, action }) {
  const company = job.companyName || 'Company not specified'

  return (
    <article className="group rounded-xl border border-border bg-white p-5 shadow-card transition-colors hover:border-slate-300">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-semibold text-muted-foreground">
          {company.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                <Link
                  to={`/jobs/${job.id}`}
                  className="rounded outline-none hover:text-primary focus-visible:text-primary"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{company}</p>
            </div>

            {job.status && job.status !== 'ACTIVE' && <JobStatusBadge status={job.status} />}
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <dd>{job.location}</dd>
              </div>
            )}
            {job.jobType && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <dd>{humanize(job.jobType)}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4" aria-hidden="true" />
              <dd>{formatSalary(job.salaryMin, job.salaryMax)}</dd>
            </div>
            {job.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <dd>{timeAgo(job.createdAt)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {job.experienceRequired ? (
              <Badge variant="outline">{job.experienceRequired} experience</Badge>
            ) : (
              <span />
            )}

            {action ||
              (applied ? (
                <Badge variant="success">Already applied</Badge>
              ) : (
                <Link to={`/jobs/${job.id}`}>
                  <Button size="sm" variant="outline">
                    View role
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </article>
  )
}
