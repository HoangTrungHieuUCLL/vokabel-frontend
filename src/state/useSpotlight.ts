import { useEffect, useState } from 'react'
import * as api from '../api/client'
import type { Spotlight } from '../api/types'

/**
 * The word currently in the spotlight, as chosen by the server.
 *
 * The pick lives on the server so the card here and the notification on the
 * phone always name the same word -- picking locally would drift apart from
 * whatever was pushed. A failed fetch simply hides the card; the rest of the
 * dashboard does not depend on it.
 */
export function useSpotlight(refreshKey: unknown = null): Spotlight | null {
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .getSpotlight()
      .then((result) => {
        if (!cancelled) setSpotlight(result)
      })
      .catch(() => {
        if (!cancelled) setSpotlight(null)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return spotlight
}
