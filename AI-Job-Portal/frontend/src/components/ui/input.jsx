import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type = 'text', invalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid || undefined}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground shadow-card transition-colors',
      'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      invalid && 'border-destructive focus-visible:ring-destructive',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
