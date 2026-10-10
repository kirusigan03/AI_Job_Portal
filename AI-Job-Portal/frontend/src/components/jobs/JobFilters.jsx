import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { EXPERIENCE_OPTIONS, JOB_STATUSES, JOB_TYPES } from '@/utils/constants'
import { humanize } from '@/utils/format'

const SALARY_STEPS = [
  { value: '', label: 'Any salary' },
  { value: '40000', label: '$40k and up' },
  { value: '70000', label: '$70k and up' },
  { value: '100000', label: '$100k and up' },
  { value: '150000', label: '$150k and up' },
]

export function JobFilters({ filters, onChange, onReset, resultCount, showStatus = true }) {
  const activeCount = Object.entries(filters).filter(
    ([key, value]) => value && !(key === 'status' && value === 'ACTIVE'),
  ).length

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card" aria-label="Job filters">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Label htmlFor="job-query" className="sr-only">
            Job title or skill
          </Label>
          <Input
            id="job-query"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Job title or skill"
            className="pl-9"
          />
        </div>

        <div className="relative flex-1">
          <Label htmlFor="job-location" className="sr-only">
            Location
          </Label>
          <Input
            id="job-location"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="City or remote"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="filter-type" className="mb-1.5">
            Job type
          </Label>
          <Select
            id="filter-type"
            value={filters.jobType}
            onChange={(e) => onChange({ jobType: e.target.value })}
          >
            <option value="">All types</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {humanize(type)}
              </option>
            ))}
          </Select>
        </div>

        {showStatus && (
          <div>
            <Label htmlFor="filter-status" className="mb-1.5">
              Status
            </Label>
            <Select
              id="filter-status"
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
            >
              <option value="">All statuses</option>
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanize(status)}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="filter-experience" className="mb-1.5">
            Experience
          </Label>
          <Select
            id="filter-experience"
            value={filters.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
          >
            <option value="">Any experience</option>
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-salary" className="mb-1.5">
            Salary
          </Label>
          <Select
            id="filter-salary"
            value={filters.salaryMin}
            onChange={(e) => onChange({ salaryMin: e.target.value })}
          >
            {SALARY_STEPS.map((step) => (
              <option key={step.value} value={step.value}>
                {step.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {typeof resultCount === 'number'
            ? `${resultCount} ${resultCount === 1 ? 'role' : 'roles'} match`
            : 'Filter the list'}
        </p>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </section>
  )
}
