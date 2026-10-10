/** Turns FULL_TIME into "Full time" for display. */
export function humanize(value) {
  if (!value) return ''
  return value
    .toString()
    .toLowerCase()
    .split('_')
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase())
}

export function formatSalary(min, max) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)

  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return 'Not disclosed'
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "3 days ago" style stamps for job listings and notifications. */
export function timeAgo(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'

  const units = [
    { limit: 3600, div: 60, name: 'minute' },
    { limit: 86400, div: 3600, name: 'hour' },
    { limit: 604800, div: 86400, name: 'day' },
    { limit: 2629800, div: 604800, name: 'week' },
    { limit: 31557600, div: 2629800, name: 'month' },
  ]

  for (const unit of units) {
    if (seconds < unit.limit) {
      const value = Math.floor(seconds / unit.div)
      return `${value} ${unit.name}${value === 1 ? '' : 's'} ago`
    }
  }

  const years = Math.floor(seconds / 31557600)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * ai-service stores skill lists as a single comma-separated string,
 * so every consumer parses them back into an array here.
 */
export function parseSkills(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function initialsFrom(...parts) {
  const text = parts.filter(Boolean).join(' ').trim()
  if (!text) return '?'
  const words = text.split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
