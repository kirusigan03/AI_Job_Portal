import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Requires both a session and one of `allow`. This mirrors the role checks the
 * backend already enforces - it hides the wrong UI, it does not replace them.
 */
export function RoleRoute({ allow = [], children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (!allow.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return children || <Outlet />
}
