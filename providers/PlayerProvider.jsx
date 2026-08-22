'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { ROOMS, ROOMS_BY_HEAT, roomById } from '@/lib/rooms'

const PlayerContext = createContext(null)

/** Where a first-time visitor lands: the busiest room on the map. */
const DEFAULT_ROOM = ROOMS_BY_HEAT[0].id

/**
 * The tuner.
 *
 * This lives above the router so that walking from a room out to Discover and
 * back does not interrupt the music. You stay in the room you can hear, even
 * while you are looking at the map of everywhere else — which is the whole
 * reason Discover is browsable rather than a modal.
 */
export function PlayerProvider({ children }) {
  const router = useRouter()

  const [roomId, setRoomId] = useState(DEFAULT_ROOM)
  const [history, setHistory] = useState([])
  const [shuffle, setShuffle] = useState(false)
  const [unplayable, setUnplayable] = useState(() => new Set())

  const room = roomById(roomId) ?? ROOMS[0]
  const track = room.track

  // Read inside callbacks that must not re-bind on every room change.
  const roomRef = useRef(roomId)
  roomRef.current = roomId
  const shuffleRef = useRef(shuffle)
  shuffleRef.current = shuffle

  const indexOf = useCallback((id) => ROOMS.findIndex((r) => r.id === id), [])

  /** Move to a room, remembering where we came from. Route follows state. */
  const enter = useCallback(
    (id, { navigate = true } = {}) => {
      if (!roomById(id)) return
      setRoomId((current) => {
        if (current === id) return current
        setHistory((past) => [current, ...past.filter((h) => h !== current)].slice(0, 14))
        return id
      })
      if (navigate) router.push(`/room/${id}`)
    },
    [router],
  )

  /** Deep links and the back button: adopt the URL without pushing another. */
  const adopt = useCallback((id) => enter(id, { navigate: false }), [enter])

  const step = useCallback(
    (delta) => {
      const ids = ROOMS.map((r) => r.id)
      if (shuffleRef.current) {
        const others = ids.filter((id) => id !== roomRef.current)
        enter(others[Math.floor(Math.random() * others.length)])
        return
      }
      const at = indexOf(roomRef.current)
      enter(ids[(at + delta + ids.length) % ids.length])
    },
    [enter, indexOf],
  )

  /** "Take me somewhere" — the discovery primitive, used all over the product. */
  const wander = useCallback(() => {
    const others = ROOMS.filter((r) => r.id !== roomRef.current)
    enter(others[Math.floor(Math.random() * others.length)].id)
  }, [enter])

  const handleEnded = useCallback(() => step(1), [step])

  const handleUnavailable = useCallback(
    (code) => {
      // eslint-disable-next-line no-console
      console.warn(`room ${roomRef.current} is unplayable (YouTube error ${code})`)
      setUnplayable((seen) => new Set(seen).add(roomRef.current))
      step(1)
    },
    [step],
  )

  const player = useYouTubePlayer({
    videoId: track.id,
    fallbackDuration: track.seconds,
    onEnded: handleEnded,
    onUnavailable: handleUnavailable,
  })

  const { armAutoplay, playing } = player

  /** Changing room while playing keeps playing. */
  const enterPlaying = useCallback(
    (id) => {
      armAutoplay()
      enter(id)
    },
    [armAutoplay, enter],
  )

  const skip = useCallback(
    (delta) => {
      if (playing) armAutoplay()
      step(delta)
    },
    [playing, armAutoplay, step],
  )

  const value = useMemo(
    () => ({
      room,
      track,
      roomId,
      history,
      shuffle,
      unplayable,
      player,
      enter,
      enterPlaying,
      adopt,
      wander,
      skip,
      next: () => skip(1),
      previous: () => skip(-1),
      toggleShuffle: () => setShuffle((s) => !s),
      /** The room after this one, for the "up next" line. */
      upNext: ROOMS[(indexOf(roomId) + 1) % ROOMS.length],
    }),
    [
      room, track, roomId, history, shuffle, unplayable, player,
      enter, enterPlaying, adopt, wander, skip, indexOf,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return context
}
