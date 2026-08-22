'use client'

import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import YouTubeHost from '@/components/player/YouTubeHost'
import { PlayerProvider, usePlayer } from '@/providers/PlayerProvider'
import { PresenceProvider } from '@/providers/PresenceProvider'
import { SessionProvider, useSession } from '@/providers/SessionProvider'

/**
 * Everything stateful, mounted once above the router.
 *
 * The YouTube embed in particular has to live here: it is a real iframe, and
 * remounting it per route would stop the music every time you opened Discover.
 */
export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <StartSession />
        <PlayerProvider>
          <PresenceProvider>
            {children}
            <Embed />
          </PresenceProvider>
        </PlayerProvider>
      </SessionProvider>
    </MotionConfig>
  )
}

/** Mints the throwaway identity on first client render. */
function StartSession() {
  const { start } = useSession()
  useEffect(start, [start])
  return null
}

function Embed() {
  const { player } = usePlayer()
  return <YouTubeHost hostRef={player.hostRef} />
}
