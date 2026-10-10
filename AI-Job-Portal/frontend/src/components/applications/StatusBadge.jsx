import { Badge } from '@/components/ui/badge'
import { humanize } from '@/utils/format'

/** One colour language for application status across every screen. */
const STATUS_VARIANTS = {
  APPLIED: 'default',
  UNDER_REVIEW: 'primary',
  SHORTLISTED: 'primary',
  INTERVIEW: 'warning',
  SELECTED: 'success',
  REJECTED: 'destructive',
}

export function StatusBadge({ status, size }) {
  if (!status) return null

  return (
    <Badge variant={STATUS_VARIANTS[status] || 'default'} size={size}>
      {humanize(status)}
    </Badge>
  )
}

const JOB_STATUS_VARIANTS = {
  ACTIVE: 'success',
  CLOSED: 'default',
  DRAFT: 'warning',
}

export function JobStatusBadge({ status, size }) {
  if (!status) return null

  return (
    <Badge variant={JOB_STATUS_VARIANTS[status] || 'default'} size={size}>
      {humanize(status)}
    </Badge>
  )
}
