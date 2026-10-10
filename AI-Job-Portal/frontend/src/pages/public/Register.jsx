import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, ArrowLeft, Briefcase, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/layout/Logo'
import { clearAuthError, login, register } from '@/store/authSlice'
import { useToast } from '@/hooks/useToast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HOME_FOR_ROLE, ROLES } from '@/utils/constants'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  {
    value: ROLES.JOB_SEEKER,
    label: 'Job seeker',
    description: 'Apply to roles and track every application.',
    icon: Search,
  },
  {
    value: ROLES.EMPLOYER,
    label: 'Employer',
    description: 'Post jobs and review ranked candidates.',
    icon: Briefcase,
  },
  {
    value: ROLES.ADMIN,
    label: 'Administrator',
    description: 'Manage users, jobs, and platform activity.',
    icon: ShieldCheck,
  },
]

export default function Register() {
  useDocumentTitle('Create account')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { registerStatus, registerError } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.JOB_SEEKER,
  })
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(form.email)
  const passwordInvalid = touched && form.password.length < 6
  const confirmInvalid = touched && form.confirmPassword !== form.password

  async function onSubmit(event) {
    event.preventDefault()
    setTouched(true)

    if (
      !/^\S+@\S+\.\S+$/.test(form.email) ||
      form.password.length < 6 ||
      form.confirmPassword !== form.password
    ) {
      return
    }

    const result = await dispatch(
      register({ email: form.email, password: form.password, role: form.role }),
    )

    if (!register.fulfilled.match(result)) return

    // Registration returns a confirmation string rather than a token, so the
    // new account is signed in straight away with the same credentials.
    const signIn = await dispatch(login({ email: form.email, password: form.password }))

    if (login.fulfilled.match(signIn)) {
      toast.success('Account created', 'Welcome to SmartJob.')
      navigate(HOME_FOR_ROLE[signIn.payload.role] || '/', { replace: true })
    } else {
      toast.success('Account created', 'Log in to continue.')
      navigate('/login', { replace: true })
    }
  }

  const loading = registerStatus === 'loading'

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
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-xl font-semibold">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Choose how you will use SmartJob. This sets what you can do on the platform.
            </p>

            {registerError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-destructive-soft p-3.5"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-destructive">{registerError}</p>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
              <fieldset>
                <legend className="text-sm font-medium text-foreground">I am joining as</legend>
                <div className="mt-2.5 grid gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const selected = form.role === option.value
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors',
                          selected
                            ? 'border-primary bg-primary-soft ring-1 ring-primary'
                            : 'border-border bg-white hover:border-slate-300',
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={selected}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          className="mt-0.5 h-4 w-4 border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <span className="flex flex-1 items-start gap-3">
                          <option.icon
                            className={cn(
                              'mt-0.5 h-[18px] w-[18px] shrink-0',
                              selected ? 'text-primary' : 'text-muted-foreground',
                            )}
                            aria-hidden="true"
                          />
                          <span>
                            <span className="block text-sm font-medium text-foreground">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div>
                <Label htmlFor="reg-email" className="mb-1.5" required>
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  invalid={emailInvalid}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
                {emailInvalid && (
                  <p className="mt-1.5 text-sm text-destructive">
                    Enter a valid email address.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="reg-password" className="mb-1.5" required>
                    Password
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    invalid={passwordInvalid}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                  {passwordInvalid && (
                    <p className="mt-1.5 text-sm text-destructive">
                      Use at least 6 characters.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-confirm" className="mb-1.5" required>
                    Confirm password
                  </Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    invalid={confirmInvalid}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat your password"
                  />
                  {confirmInvalid && (
                    <p className="mt-1.5 text-sm text-destructive">
                      Both passwords must match.
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Create account
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="rounded font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}




