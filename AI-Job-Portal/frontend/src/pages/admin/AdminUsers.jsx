import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { useAdminData } from '@/hooks/useAdminData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { initialsFrom } from '@/utils/format'

export default function AdminUsers() {
  useDocumentTitle('Users')

  const { users, applications, loading, error, reload } = useAdminData()
  const [query, setQuery] = useState('')

  const applicationCounts = useMemo(() => {
    const counts = new Map()
    applications.forEach(({ application }) => {
      counts.set(
        application.candidateId,
        (counts.get(application.candidateId) || 0) + 1,
      )
    })
    return counts
  }, [applications])

  const rows = useMemo(() => {
    if (!query.trim()) return users

    const needle = query.trim().toLowerCase()
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.location]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [users, query])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Users"
        description="Every profile created on the platform."
        actions={
          <Button variant="outline" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Label htmlFor="user-search" className="sr-only">
              Search users
            </Label>
            <Input
              id="user-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email or location"
              className="pl-9"
            />
          </div>

          {!loading && users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No profiles yet"
              description="Profiles appear here once users complete their details after registering."
            />
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead className="hidden lg:table-cell">User ID</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading && <SkeletonRows rows={6} columns={5} />}

                    {!loading && rows.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={5}
                          className="py-12 text-center text-muted-foreground"
                        >
                          No users match that search.
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      rows.map((user) => (
                        <TableRow key={user.id ?? user.userId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                src={user.profileImageUrl}
                                initials={
                                  initialsFrom(user.firstName, user.lastName) || 'U'
                                }
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
                                    'Unnamed'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden text-muted-foreground md:table-cell">
                            {user.location || '-'}
                          </TableCell>

                          <TableCell className="hidden text-muted-foreground sm:table-cell">
                            {user.phone || '-'}
                          </TableCell>

                          <TableCell className="tabular-nums">
                            {applicationCounts.get(user.userId) || 0}
                          </TableCell>

                          <TableCell className="hidden tabular-nums text-muted-foreground lg:table-cell">
                            {user.userId}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
