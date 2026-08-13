'use client'

import { useCallback, useMemo, useState } from 'react'
import { shuffledFrom } from '@/lib/utils/shuffle'

/**
 * Play order over a playlist. `order` is a list of playlist indices and
 * `pointer` is where we are inside it, so shuffling only rewrites the order and
 * never touches the playlist itself.
 *
 * @param {Array<{id: string}>} playlist
 */
export function usePlaybackQueue(playlist) {
  const natural = useMemo(() => playlist.map((_, i) => i), [playlist])

  const [order, setOrder] = useState(natural)
  const [pointer, setPointer] = useState(0)
  const [shuffle, setShuffle] = useState(false)

  const trackIndex = order[pointer] ?? 0
  const track = playlist[trackIndex]

  /** Move `delta` places through the queue, wrapping at both ends. */
  const step = useCallback(
    (delta) => {
      setPointer((p) => (p + delta + order.length) % order.length)
    },
    [order.length],
  )

  /** Jump to a playlist index wherever it currently sits in the order. */
  const jumpToTrack = useCallback(
    (playlistIndex) => {
      const at = order.indexOf(playlistIndex)
      if (at === -1) return
      setPointer(at)
    },
    [order],
  )

  /** Flips shuffle, keeping the current track playing. Returns the new state. */
  const toggleShuffle = useCallback(() => {
    // Computed out here rather than inside a state updater: StrictMode invokes
    // updaters twice, which would reshuffle and land on a different track.
    const next = !shuffle
    setShuffle(next)
    if (next) {
      setOrder(shuffledFrom(natural, trackIndex))
      setPointer(0)
    } else {
      setOrder(natural)
      setPointer(trackIndex)
    }
    return next
  }, [shuffle, trackIndex, natural])

  const position = useMemo(() => `${pointer + 1} / ${order.length}`, [pointer, order.length])

  return {
    order,
    pointer,
    trackIndex,
    track,
    shuffle,
    position,
    step,
    jumpToTrack,
    toggleShuffle,
  }
}
