import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Click-outside-dismissible menu used for the account and row action menus.
 * `trigger` receives the open state so it can render its own affordance.
 */
export function Dropdown({ trigger, children, align = 'right', className, menuClassName }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {typeof trigger === 'function' ? trigger(open) : trigger}
      </div>

      {open && (
        <div
          id={menuId}
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-white p-1 shadow-pop animate-slide-in',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ className, icon: Icon, destructive, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
        destructive
          ? 'text-destructive hover:bg-destructive-soft'
          : 'text-foreground hover:bg-muted',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function DropdownLabel({ children }) {
  return <p className="px-3 py-2 text-xs font-medium text-muted-foreground">{children}</p>
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />
}
