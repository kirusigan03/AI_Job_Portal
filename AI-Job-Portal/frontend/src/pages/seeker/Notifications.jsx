import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import {
  fetchNotifications,
  isUnread,
  markNotificationRead,
} from '@/store/notificationSlice'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function Notifications() {
  useDocumentTitle('Notifications')

  const dispatch = useDispatch()
  const toast = useToast()
  const { items, status, error } = useSelector((state) => state.notifications)

  const [tab, setTab] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const unread = useMemo(() => items.filter(isUnread), [items])
  const rows = tab === 'unread' ? unread : items

  async function onMarkAllRead() {
    setMarkingAll(true)
    const results = await Promise.all(
      unread.map((notification) => dispatch(markNotificationRead(notification.id))),
    )
    setMarkingAll(false)

    const failed = results.filter((result) => !markNotificationRead.fulfilled.match(result))
    if (failed.length > 0) {
      toast.error('Some notifications could not be updated', 'Try again in a moment.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates on your applications and resume evaluations."
        actions={
          unread.length > 0 ? (
            <Button variant="outline" loading={markingAll} onClick={onMarkAllRead}>
              Mark all read
            </Button>
          ) : null
        }
      />

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchNotifications())} />
      ) : status === 'succeeded' && items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nothing to catch up on"
          description="You will hear from us when an application is submitted, its status changes, or a resume evaluation finishes."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="px-5 pt-2 sm:px-6">
            <Tabs
              tabs={[
                { value: 'all', label: 'All', count: items.length },
                { value: 'unread', label: 'Unread', count: unread.length },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>

          <CardContent className="p-0">
            {status === 'loading' && (
              <div className="space-y-4 p-5 sm:p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            )}

            {status === 'succeeded' && rows.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No unread notifications.
              </p>
            )}

            {status === 'succeeded' && rows.length > 0 && (
              <ul className="divide-y divide-border">
                {rows.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    unread={isUnread(notification)}
                    onMarkRead={(id) => dispatch(markNotificationRead(id))}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
