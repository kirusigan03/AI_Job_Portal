import { cn } from '@/lib/utils'

const TONES = {
  strong: { stroke: 'stroke-success', text: 'text-success' },
  good: { stroke: 'stroke-primary', text: 'text-primary' },
  weak: { stroke: 'stroke-warning', text: 'text-warning' },
}

export function toneForScore(score) {
  if (score >= 80) return 'strong'
  if (score >= 60) return 'good'
  return 'weak'
}

/**
 * The headline match score. An SVG ring keeps it crisp at every size and
 * needs no chart library.
 */
export function ScoreRing({ value, size = 160, strokeWidth = 12, label = 'Overall match', className }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
  const tone = TONES[toneForScore(score)]

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${score} out of 100`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={cn('transition-[stroke-dashoffset] duration-700 ease-out', tone.stroke)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('font-semibold tabular-nums', tone.text)}
            style={{ fontSize: size / 4 }}
          >
            {score}%
          </span>
        </div>
      </div>
      {label && <p className="mt-3 text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}
