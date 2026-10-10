import { Check, X } from 'lucide-react'
import { APPLICATION_PIPELINE } from '@/utils/constants'
import { formatDateTime, humanize } from '@/utils/format'
import { cn } from '@/lib/utils'

/**
 * application-service stores only the current status and its timestamp, so the
 * timeline shows how far the application has travelled rather than inventing
 * dates for steps the backend never recorded.
 */
export function ApplicationTimeline({ status, appliedAt, updatedAt }) {
  const rejected = status === 'REJECTED'
  const currentIndex = APPLICATION_PIPELINE.indexOf(status)

  const steps = APPLICATION_PIPELINE.map((step, index) => ({
    key: step,
    label: humanize(step),
    state:
      rejected && index > 0
        ? 'idle'
        : index < currentIndex
          ? 'done'
          : index === currentIndex
            ? 'current'
            : 'idle',
  }))

  if (rejected) {
    steps.push({ key: 'REJECTED', label: 'Not selected', state: 'rejected' })
  }

  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        const done = step.state === 'done'
        const current = step.state === 'current'
        const isRejected = step.state === 'rejected'

        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-full w-px',
                  done ? 'bg-primary/40' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold',
                done && 'border-primary bg-primary text-primary-foreground',
                current && 'border-primary bg-white text-primary',
                isRejected && 'border-destructive bg-destructive text-destructive-foreground',
                step.state === 'idle' && 'border-border bg-white text-muted-foreground',
              )}
            >
              {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {isRejected && <X className="h-3.5 w-3.5" aria-hidden="true" />}
              {current && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  current || done || isRejected ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
              {index === 0 && appliedAt && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(appliedAt)}
                </p>
              )}
              {(current || isRejected) && index !== 0 && updatedAt && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Updated {formatDateTime(updatedAt)}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
