'use client'

import { useEffect, useState } from 'react'
import { CLOCK_TICK_MS } from '@/lib/constants'

/**
 * Ticking wall clock. `null` until mounted on purpose: the server has no idea
 * what time it is where the visitor is, and rendering its own clock would
 * hydrate mismatched.
 *
 * @returns {Date | null}
 */
export function useClock(tick = CLOCK_TICK_MS) {
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), tick)
    return () => clearInterval(id)
  }, [tick])

  return now
}
