'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { identityFor, newSessionId } from '@/lib/identity'

const SessionContext = createContext(null)

/**
 * Who you are for the next few minutes.
 *
 * The id is minted in the browser, held in memory, and never written anywhere —
 * not to a cookie, not to localStorage, not to a server. Closing the tab ends
 * the person. Reopening it creates a different one, which is the point: the
 * costume is supposed to be disposable, and `reroll` lets you change it on
 * purpose if a room starts to feel like it knows you.
 */
export function SessionProvider({ children }) {
  // Lazily, and only on the client — an id generated during SSR would be sent
  // to every visitor and would stop being anonymous the moment it was cached.
  const [id, setId] = useState(null)

  const value = useMemo(() => {
    const ensured = id
    return {
      /** `null` until the first client render. Components guard on `ready`. */
      self: ensured ? identityFor(ensured) : null,
      ready: Boolean(ensured),
      start: () => setId((current) => current ?? newSessionId()),
      reroll: () => setId(newSessionId()),
    }
  }, [id])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
