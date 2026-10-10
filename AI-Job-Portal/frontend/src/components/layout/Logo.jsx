import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ to = '/', className, compact = false }) {
  return (
    <Link
      to={to}
      className={cn('flex items-center gap-2.5 rounded-lg', className)}
      aria-label="SmartJob home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        SJ
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
          SmartJob
        </span>
      )}
    </Link>
  )
}
