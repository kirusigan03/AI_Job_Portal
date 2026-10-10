import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/api/axios'

/**
 * Runs a request on mount and exposes { data, loading, error, reload }.
 * Used by the pages whose data does not need to live in Redux.
 */
export function useAsync(asyncFn, deps = [], { immediate = true, fallbackMessage } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      if (mounted.current) setData(result)
      return result
    } catch (err) {
      if (mounted.current) setError(getErrorMessage(err, fallbackMessage))
      return null
    } finally {
      if (mounted.current) setLoading(false)
    }
    // The caller controls when this re-runs by passing its own dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) run()
  }, [run, immediate])

  return { data, setData, loading, error, reload: run }
}
