import { useEffect, useState } from 'react'
import aiApi from '@/api/aiApi'

/**
 * ai-service has no bulk endpoint, so scores for a list of applications are
 * fetched one at a time. A 404 means the Kafka-driven evaluation has not
 * finished yet, so pending applications are retried until their score exists.
 */
export function useAiScores(applicationIds = []) {
  const [scores, setScores] = useState({})
  const [pending, setPending] = useState(false)

  const key = applicationIds.join(',')

  useEffect(() => {
    const ids = applicationIds.filter((id) => id != null)
    if (ids.length === 0) {
      setPending(false)
      return undefined
    }

    let cancelled = false
    let timer
    let attempts = 0
    const maxAttempts = 12
    const resolvedIds = new Set()

    async function fetchScores() {
      if (cancelled || attempts >= maxAttempts) {
        setPending(false)
        return
      }

      attempts += 1
      const unresolvedIds = ids.filter((id) => !resolvedIds.has(id))
      const entries = await Promise.all(
        unresolvedIds.map(async (id) => {
          try {
            return [id, await aiApi.getForApplication(id)]
          } catch {
            return [id, null]
          }
        }),
      )

      if (cancelled) return

      const resolved = Object.fromEntries(entries.filter(([, score]) => score))
      entries.forEach(([id, score]) => {
        if (score) resolvedIds.add(id)
      })
      setScores((previous) => ({ ...previous, ...resolved }))

      const hasPending = resolvedIds.size < ids.length && attempts < maxAttempts
      setPending(hasPending)
      if (hasPending) timer = window.setTimeout(fetchScores, 5000)
    }

    setPending(true)
    fetchScores()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // The joined key changes when the application list changes.
  }, [key])

  return { scores, pending }
}
