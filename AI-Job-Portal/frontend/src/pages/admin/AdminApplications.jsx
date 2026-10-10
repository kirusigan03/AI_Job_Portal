import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SkeletonRows } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { useAdminData } from '@/hooks/useAdminData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APPLICATION_STATUSES } from '@/utils/constants'
import { formatDate, formatDateTime, humanize } from '@/utils/format'

export default function AdminApplications() {
  useDocumentTitle('Applications')

  const { applications, users, loading, error, reload } = useAdminData()
  const [tab, setTab] = useState('ALL')

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.userId, user])),
    [users],
  )

  const sorted = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.application.appliedAt || 0) - new Date(a.application.appliedAt || 0),
      ),
    [applications],
  )

  const rows = tab === 'ALL' ? sorted : sorted.filter((row) => row.application.status === tab)

  const tabs = [
    { value: 'ALL', label: 'All', count: sorted.length },
    ...APPLICATION_STATUSES.map((status) => ({
      value: status,
      label: humanize(status),
      count: sorted.filter((row) => row.application.status === status).length,
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Applications"
        description="Every application submitted across the platform."
        actions={
          <Button variant="outline" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !loading && sorted.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Applications appear here once candidates start applying to roles."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="px-5 pt-2 sm:px-6">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Applied</TableHead>
                  <TableHead className="hidden lg:table-cell">Last updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && <SkeletonRows rows={8} columns={5} />}

                {!loading && rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No applications with this status.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  rows.map(({ application, job }) => {
                    const user = usersById.get(application.candidateId)

                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
                              `Candidate #${application.candidateId}`}
                          </p>
                          {user?.email && (
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="max-w-[14rem]">
                          <p className="truncate text-sm">{job.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {job.companyName || 'Company not specified'}
                          </p>
                        </TableCell>

                        <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                          {formatDate(application.appliedAt)}
                        </TableCell>

                        <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                          {formatDateTime(application.updatedAt)}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={application.status} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
