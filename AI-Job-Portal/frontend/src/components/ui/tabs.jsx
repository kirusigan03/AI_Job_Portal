import { cn } from '@/lib/utils'

/**
 * Controlled tab strip. Arrow keys move between tabs the way a tablist should.
 */
export function Tabs({ tabs, value, onChange, className }) {
  function onKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.value === value)
    if (index === -1) return

    let nextIndex = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length

    if (nextIndex !== null) {
      event.preventDefault()
      onChange(tabs[nextIndex].value)
    }
  }

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn('flex gap-1 overflow-x-auto border-b border-border scrollbar-thin', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'ml-2 rounded-md px-1.5 py-0.5 text-xs',
                  active ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
