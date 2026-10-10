import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Checkbox = forwardRef(({ className, label, description, id, ...props }, ref) => (
  <div className="flex items-start gap-3">
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
    {(label || description) && (
      <div className="space-y-0.5">
        {label && (
          <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    )}
  </div>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
