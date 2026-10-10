import { Loader2, Minus } from 'lucide-react'
import { toneForScore } from './ScoreRing'
import { cn } from '@/lib/utils'

const TEXT_TONE = {
  strong: 'text-success',
  good: 'text-primary',
  weak: 'text-warning',
}

const BAR_TONE = {
  strong: 'bg-success',
  good: 'bg-primary',
  weak: 'bg-warning',
}

/**
 * Compact score for table rows. `pending` covers the window between applying
 * and ai-service finishing its evaluation.
 */
export function AiScoreCell({ score, pending = false }) {
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Scoring
      </span>
    )
  }

  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        Not scored
      </span>
    )
  }

  const value = Math.max(0, Math.min(100, Math.round(score)))
  const tone = toneForScore(value)

  return (
    <span className="flex items-center gap-2.5">
      <span className={cn('text-sm font-semibold tabular-nums', TEXT_TONE[tone])}>{value}%</span>
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
        <span
          className={cn('block h-full rounded-full', BAR_TONE[tone])}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  )
}
