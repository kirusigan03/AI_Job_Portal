import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ExternalLink, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { logout } from '@/store/authSlice'
import { clearNotifications } from '@/store/notificationSlice'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { API_BASE_URL } from '@/api/axios'
import { ROLE_LABELS } from '@/utils/constants'

export default function Settings() {
  useDocumentTitle('Settings')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { email, role, userId, isJobSeeker } = useAuth()

  const [confirmOpen, setConfirmOpen] = useState(false)

  function onSignOut() {
    dispatch(clearNotifications())
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Your account and how SmartJob is connected." />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="divide-y divide-border">
            <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="truncate text-sm font-medium">{email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd>
                <Badge variant="primary">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {ROLE_LABELS[role] || role}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <dt className="text-sm text-muted-foreground">Account ID</dt>
              <dd className="text-sm font-medium tabular-nums">{userId}</dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-muted-foreground">
            Your email address and role are set when the account is created and cannot be changed
            here. To change either, contact support.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile and documents</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Link
            to="/profile"
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:border-slate-300 hover:bg-muted/50"
          >
            <span>
              <span className="block text-sm font-medium">Profile details</span>
              <span className="block text-sm text-muted-foreground">
                Name, location, bio and links.
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>

          {isJobSeeker && (
            <Link
              to="/resumes"
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:border-slate-300 hover:bg-muted/50"
            >
              <span>
                <span className="block text-sm font-medium">Resumes</span>
                <span className="block text-sm text-muted-foreground">
                  Upload, review and delete the files you apply with.
                </span>
              </span>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">API gateway</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Every request from this app goes through this address.
              </p>
            </div>
            <code className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {API_BASE_URL}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This clears your session on this device. Your applications and resumes are unaffected.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setConfirmOpen(true)}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Log out of SmartJob?"
        description="You will need to sign in again to see your applications."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Stay signed in
            </Button>
            <Button variant="destructive" onClick={onSignOut}>
              Log out
            </Button>
          </>
        }
      />
    </div>
  )
}
