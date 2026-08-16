'use client'

import { useCallback, useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePlaybackQueue } from '@/hooks/usePlaybackQueue'
import { useToast } from '@/hooks/useToast'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import { SEEK_STEP_SECONDS } from '@/lib/constants'
import { PLAYLIST } from '@/lib/playlist'

/**
 * Wires the queue, the YouTube embed, the toast and the keyboard together and
 * hands the UI one flat view model. Everything stateful about the app lives
 * here, which keeps every component under `components/` presentational.
 *
 * @param {Array} [playlist]
 */
export function useChillOffice(playlist = PLAYLIST) {
  const queue = usePlaybackQueue(playlist)
  const { message: toast, notify } = useToast()

  /** Only used below `lg`, where the track list is a sheet rather than a column. */
  const [queueOpen, setQueueOpen] = useState(false)
  /** `true` hands the screen to the office artwork and shrinks the player. */
  const [ambience, setAmbience] = useState(false)
  /** Video ids YouTube refused, flagged in the list so it stays honest. */
  const [brokenIds, setBrokenIds] = useState(() => new Set())

  const { track, step, jumpToTrack } = queue

  const handleEnded = useCallback(() => step(1), [step])

  const handleUnavailable = useCallback(
    (code) => {
      const seen = new Set(brokenIds)
      seen.add(track.id)
      setBrokenIds(seen)
      // eslint-disable-next-line no-console
      console.warn(`YouTube refused ${track.id} (error ${code})`)

      // Don't chase our own tail if the whole queue is unplayable.
      if (seen.size >= playlist.length) {
        notify('No tracks are playable right now')
        return
      }
      notify(`“${track.title}” won’t play here — skipping`)
      step(1)
    },
    [brokenIds, track, playlist.length, notify, step],
  )

  const player = useYouTubePlayer({
    videoId: track.id,
    fallbackDuration: track.seconds,
    onEnded: handleEnded,
    onUnavailable: handleUnavailable,
  })

  const { playing, armAutoplay } = player

  /** Change track, carrying "keep playing" across the swap. */
  const skip = useCallback(
    (delta) => {
      if (playing) armAutoplay()
      step(delta)
    },
    [playing, armAutoplay, step],
  )

  /** Picking a row in the track list always starts playback. */
  const jumpTo = useCallback(
    (playlistIndex) => {
      armAutoplay()
      jumpToTrack(playlistIndex)
      // On small screens the list is a sheet over the player — get out of the way.
      setQueueOpen(false)
    },
    [armAutoplay, jumpToTrack],
  )

  const toggleShuffle = useCallback(() => {
    notify(queue.toggleShuffle() ? 'Shuffle on' : 'Shuffle off')
  }, [queue, notify])

  const toggleMute = useCallback(() => {
    player.toggleMute()
    // `muted` is still the pre-toggle value on this render, hence the flip.
    notify(player.muted ? 'Sound on' : 'Muted')
  }, [player, notify])

  const openQueue = useCallback(() => setQueueOpen(true), [])
  const closeQueue = useCallback(() => setQueueOpen(false), [])
  const toggleQueue = useCallback(() => setQueueOpen((open) => !open), [])

  /** Switching views closes the sheet, which would otherwise cover the artwork. */
  const selectView = useCallback((next) => {
    setAmbience(next)
    setQueueOpen(false)
  }, [])
  const toggleAmbience = useCallback(() => selectView(!ambience), [selectView, ambience])

  useKeyboardShortcuts({
    onTogglePlay: player.toggle,
    onSeekForward: () => player.nudge(SEEK_STEP_SECONDS),
    onSeekBackward: () => player.nudge(-SEEK_STEP_SECONDS),
    onNext: () => skip(1),
    onPrevious: () => skip(-1),
    onToggleMute: toggleMute,
    onToggleShuffle: toggleShuffle,
    onToggleQueue: toggleQueue,
    onToggleAmbience: toggleAmbience,
    onCloseQueue: closeQueue,
  })

  return {
    playlist,
    queue,
    player,
    track,
    toast,
    brokenIds,
    queueOpen,
    ambience,
    openQueue,
    closeQueue,
    selectView,
    skip,
    jumpTo,
    toggleShuffle,
    toggleMute,
  }
}
