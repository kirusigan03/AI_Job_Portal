import { cn } from '@/lib/utils'

const toneClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export function Progress({ value = 0, tone = 'primary', className, label }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', toneClasses[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
