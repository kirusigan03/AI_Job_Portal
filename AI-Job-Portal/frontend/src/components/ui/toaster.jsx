import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { dismissToast } from '@/store/uiSlice'
import { cn } from '@/lib/utils'

const TOAST_DURATION = 5000

const variants = {
  default: { icon: Info, accent: 'text-primary', border: 'border-border' },
  success: { icon: CheckCircle2, accent: 'text-success', border: 'border-emerald-200' },
  destructive: { icon: XCircle, accent: 'text-destructive', border: 'border-red-200' },
}

function Toast({ toast }) {
  const dispatch = useDispatch()
  const { icon: Icon, accent, border } = variants[toast.variant] || variants.default

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white p-4 shadow-pop animate-slide-in',
        border,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', accent)} aria-hidden="true" />
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="rounded-md p-0.5 text-slate-400 transition-colors hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useSelector((state) => state.ui.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-96 sm:flex-col-reverse"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
