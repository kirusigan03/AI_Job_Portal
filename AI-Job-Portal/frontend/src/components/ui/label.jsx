import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Label = forwardRef(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-sm font-medium text-foreground', className)}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-0.5 text-destructive" aria-hidden="true">
        *
      </span>
    )}
  </label>
))
Label.displayName = 'Label'

export { Label }
