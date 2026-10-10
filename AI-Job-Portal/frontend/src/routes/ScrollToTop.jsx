import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Navigating to a new route should start at the top, not keep the old scroll. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])

  return null
}
