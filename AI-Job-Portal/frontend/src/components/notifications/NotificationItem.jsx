import { Bell, CheckCircle2, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/utils/format'
import { cn } from '@/lib/utils'

/** Picks an icon from the notification title Kafka consumers write. */
function iconFor(title = '') {
  const value = title.toLowerCase()
  if (value.includes('evaluat') || value.includes('match') || value.includes('ai')) return Sparkles
  if (value.includes('status')) return CheckCircle2
  if (value.includes('application')) return FileText
  return Bell
}

export function NotificationItem({ notification, unread, onMarkRead }) {
  const Icon = iconFor(notification.title)

  return (
    <li
      className={cn(
        'flex gap-4 px-5 py-4 transition-colors',
        unread ? 'bg-primary-soft/50' : 'bg-white',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          unread ? 'bg-white text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              'text-sm',
              unread ? 'font-semibold text-foreground' : 'font-medium text-foreground',
            )}
          >
            {notification.title}
          </p>
          {unread && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />
          )}
        </div>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
      </div>

      {unread && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-start"
          onClick={() => onMarkRead(notification.id)}
        >
          Mark read
        </Button>
      )}
    </li>
  )
}
