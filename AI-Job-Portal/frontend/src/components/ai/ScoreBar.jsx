import { Progress } from '@/components/ui/progress'
import { toneForScore } from './ScoreRing'

const PROGRESS_TONE = { strong: 'success', good: 'primary', weak: 'warning' }

export function ScoreBar({ label, value }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value) || 0)))

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{score}%</span>
      </div>
      <Progress value={score} tone={PROGRESS_TONE[toneForScore(score)]} label={label} />
    </div>
  )
}
