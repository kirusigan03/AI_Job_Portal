import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
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
import { JobStatusBadge } from '@/components/applications/StatusBadge'
import { useAdminData } from '@/hooks/useAdminData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { JOB_STATUSES } from '@/utils/constants'
import { formatDate, formatSalary, humanize } from '@/utils/format'

export default function AdminJobs() {
  useDocumentTitle('Jobs')

  const { jobs, applications, loading, error, reload } = useAdminData()
  const [tab, setTab] = useState('ALL')

  const counts = useMemo(() => {
    const map = new Map()
    applications.forEach(({ job }) => map.set(job.id, (map.get(job.id) || 0) + 1))
    return map
  }, [applications])

  const sorted = useMemo(
    () => [...jobs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [jobs],
  )

  const rows = tab === 'ALL' ? sorted : sorted.filter((job) => job.status === tab)

  const tabs = [
    { value: 'ALL', label: 'All', count: sorted.length },
    ...JOB_STATUSES.map((status) => ({
      value: status,
      label: humanize(status),
      count: sorted.filter((job) => job.status === status).length,
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Jobs"
        description="Every posting across all employers."
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
          icon={Briefcase}
          title="No jobs posted yet"
          description="Jobs appear here as employers publish them."
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
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Salary</TableHead>
                  <TableHead className="hidden sm:table-cell">Posted</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Employer</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && <SkeletonRows rows={6} columns={6} />}

                {!loading && rows.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      No jobs with this status.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  rows.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="block rounded font-medium hover:text-primary"
                        >
                          {job.title}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.companyName || 'Company not specified'}
                          {job.location ? ` · ${job.location}` : ''}
                        </p>
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                        {formatDate(job.createdAt)}
                      </TableCell>

                      <TableCell className="tabular-nums">{counts.get(job.id) || 0}</TableCell>

                      <TableCell>
                        <JobStatusBadge status={job.status} />
                      </TableCell>

                      <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                        #{job.employerId}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
