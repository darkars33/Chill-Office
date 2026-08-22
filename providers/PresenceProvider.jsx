'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePlayer } from '@/providers/PlayerProvider'
import { useSession } from '@/providers/SessionProvider'
import { RENDERED_PEOPLE_CAP, createPresenceClient } from '@/lib/presence'

const PresenceContext = createContext(null)

const EMPTY = {
  total: 0,
  people: [],
  messages: [],
  reactions: [],
  activity: [],
  whispers: {},
}

/**
 * The room's population, for whichever room the tuner is on.
 *
 * A new client is built on every room change and torn down on the way out —
 * that teardown is the product behaviour, not just cleanup. Leaving a room
 * destroys the conversation; there is nothing to come back to.
 */
export function PresenceProvider({ children }) {
  const { room } = usePlayer()
  const { self, ready } = useSession()

  const [state, setState] = useState(EMPTY)
  const clientRef = useRef(null)

  useEffect(() => {
    if (!ready || !self) return undefined

    const client = createPresenceClient({ room, self, cap: RENDERED_PEOPLE_CAP })
    clientRef.current = client
    const unsubscribe = client.subscribe(setState)

    return () => {
      unsubscribe()
      client.destroy()
      clientRef.current = null
      setState(EMPTY)
    }
    // `room.id` rather than `room`: the object is rebuilt on every render of the
    // player provider, and rebinding presence on that would reset the room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, ready, self?.id])

  const value = useMemo(() => {
    const call = (method) => (...args) => clientRef.current?.[method](...args)
    return {
      ...state,
      self,
      say: call('say'),
      react: call('react'),
      openWhisper: call('openWhisper'),
      sendWhisper: call('sendWhisper'),
      closeWhisper: call('closeWhisper'),
    }
  }, [state, self])

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (!context) throw new Error('usePresence must be used inside <PresenceProvider>')
  return context
}
