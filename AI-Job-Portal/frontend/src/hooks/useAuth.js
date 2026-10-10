import { useSelector } from 'react-redux'
import { ROLES } from '@/utils/constants'

/** Convenience view over the auth slice used across pages and guards. */
export function useAuth() {
  const auth = useSelector((state) => state.auth)

  return {
    ...auth,
    isAuthenticated: Boolean(auth.token),
    isJobSeeker: auth.role === ROLES.JOB_SEEKER,
    isEmployer: auth.role === ROLES.EMPLOYER,
    isAdmin: auth.role === ROLES.ADMIN,
  }
}
