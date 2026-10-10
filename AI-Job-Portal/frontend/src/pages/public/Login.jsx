import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/layout/Logo'
import { clearAuthError, login } from '@/store/authSlice'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HOME_FOR_ROLE } from '@/utils/constants'

export default function Login() {
  useDocumentTitle('Log in')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const { status, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(form.email)
  const passwordInvalid = touched && form.password.length === 0

  async function onSubmit(event) {
    event.preventDefault()
    setTouched(true)

    if (!/^\S+@\S+\.\S+$/.test(form.email) || !form.password) return

    const result = await dispatch(login(form))

    if (login.fulfilled.match(result)) {
      const { role, email } = result.payload
      toast.success('Signed in', email)

      const next = searchParams.get('next')
      const fallback = HOME_FOR_ROLE[role] || '/'
      navigate(next && next.startsWith('/') ? next : fallback, { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="container flex items-center justify-between py-6">
        <Logo />
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to site
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-xl font-semibold">Log in to SmartJob</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pick up where you left off with your applications and jobs.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-destructive-soft p-3.5"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  invalid={emailInvalid}
                  aria-describedby={emailInvalid ? 'email-error' : undefined}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
                {emailInvalid && (
                  <p id="email-error" className="mt-1.5 text-sm text-destructive">
                    Enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="mb-1.5" required>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  invalid={passwordInvalid}
                  aria-describedby={passwordInvalid ? 'password-error' : undefined}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                {passwordInvalid && (
                  <p id="password-error" className="mt-1.5 text-sm text-destructive">
                    Enter your password.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" loading={status === 'loading'}>
                Log in
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to SmartJob?{' '}
            <Link to="/register" className="rounded font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
