import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-muted-foreground',
        primary: 'border-indigo-100 bg-primary-soft text-primary',
        success: 'border-emerald-100 bg-success-soft text-success',
        warning: 'border-amber-100 bg-warning-soft text-warning',
        destructive: 'border-red-100 bg-destructive-soft text-destructive',
        outline: 'border-border bg-white text-foreground',
      },
      size: {
        default: 'text-xs',
        sm: 'px-1.5 py-0 text-[11px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Badge({ className, variant, size, ...props }) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
