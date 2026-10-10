import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { HOME_FOR_ROLE } from '@/utils/constants'

/** Keeps signed-in users off the login and register screens. */
export function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={HOME_FOR_ROLE[role] || '/'} replace />
  }

  return children || <Outlet />
}
