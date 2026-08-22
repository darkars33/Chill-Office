'use client'

import { useEffect, useState } from 'react'

/**
 * Nudges room populations up and down over time.
 *
 * A live map whose numbers never move is a screenshot, and reads as one within
 * about two seconds. The baseline comes from `lib/rooms` and is deterministic —
 * the drift is applied only after mount, so the server and the first client
 * render still agree.
 *
 * Like everything else about presence right now, this is invented locally; the
 * SIMULATED badge is on the screens that use it.
 *
 * @param {Array<{id: string, listeners: number}>} rooms
 * @returns {Record<string, number>}
 */
export function useLiveCounts(rooms, { intervalMs = 3200 } = {}) {
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(rooms.map((room) => [room.id, room.listeners])),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((current) => {
        const nextCounts = { ...current }
        // Only a slice of the map moves per tick, so the whole board does not
        // shimmer at once.
        for (const room of rooms) {
          if (Math.random() > 0.28) continue
          const spread = Math.max(1, Math.round(room.listeners * 0.03))
          const delta = Math.round((Math.random() - 0.48) * spread * 2)
          nextCounts[room.id] = Math.max(0, (current[room.id] ?? room.listeners) + delta)
        }
        return nextCounts
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [rooms, intervalMs])

  return counts
}
