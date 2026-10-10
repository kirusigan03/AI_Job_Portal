import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { HOME_FOR_ROLE, ROLE_LABELS } from '@/utils/constants'

export default function Forbidden() {
  useDocumentTitle('Access denied')

  const { role, isAuthenticated } = useAuth()
  const home = HOME_FOR_ROLE[role] || '/'

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft">
        <Lock className="h-7 w-7 text-warning" aria-hidden="true" />
      </span>

      <p className="mt-6 text-sm font-medium text-muted-foreground">403</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
        You do not have access to this page
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isAuthenticated
          ? `This area is not available to ${ROLE_LABELS[role] || 'your'} accounts. Your own dashboard has everything you can do here.`
          : 'Log in with an account that has access to continue.'}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={isAuthenticated ? home : '/login'}>
          <Button>{isAuthenticated ? 'Go to my dashboard' : 'Log in'}</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
    </div>
  )
}
