'use client'

import { useEffect, useState } from 'react'

/**
 * A media query as state, for the handful of places where the layout has to
 * change in JavaScript rather than in CSS — the constellation transposes its
 * coordinate space on a phone, which no amount of styling can do.
 *
 * Starts `false` and resolves after mount, so the server and the first client
 * render always agree.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const list = window.matchMedia(query)
    setMatches(list.matches)
    const onChange = (event) => setMatches(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
