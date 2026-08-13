'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  EMBED_SIZE,
  FATAL_PLAYER_ERRORS,
  MAX_PLAYER_RETRIES,
  PROGRESS_TICK_MS,
} from '@/lib/constants'
import { loadIframeApi } from '@/lib/youtube-iframe-api'

/**
 * Drives a single off-screen YouTube embed: load, play, seek, mute and error
 * recovery. Mount `hostRef` on a laid-out element (see `<YouTubeHost />`).
 *
 * @param {object}   options
 * @param {string}   options.videoId           track to play
 * @param {number}   [options.fallbackDuration] runtime to show until YouTube reports the real one
 * @param {Function} [options.onEnded]          track finished on its own
 * @param {Function} [options.onUnavailable]    track cannot be played here, called with the error code
 */
export function useYouTubePlayer({ videoId, fallbackDuration, onEnded, onUnavailable }) {
  const hostRef = useRef(null)
  const playerRef = useRef(null)
  const wantPlayRef = useRef(false)
  const loadedIdRef = useRef(null)
  const retriesRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)

  // Kept in refs so the player's event handlers never close over stale props.
  const endedRef = useRef(onEnded)
  const unavailableRef = useRef(onUnavailable)
  useEffect(() => {
    endedRef.current = onEnded
    unavailableRef.current = onUnavailable
  }, [onEnded, onUnavailable])

  // The player is constructed once, but needs whatever track is current at that
  // moment. Built without a videoId, the embed can sit there never firing ready.
  const videoIdRef = useRef(videoId)
  videoIdRef.current = videoId

  const syncTime = useCallback(() => {
    const p = playerRef.current
    if (!p?.getCurrentTime) return
    setTime(p.getCurrentTime() || 0)
    const d = p.getDuration?.() || 0
    if (d > 0) setDuration(d)
  }, [])

  // ---- create the player once ----
  useEffect(() => {
    let cancelled = false

    loadIframeApi().then(() => {
      if (cancelled || playerRef.current || !hostRef.current) return

      loadedIdRef.current = videoIdRef.current

      playerRef.current = new window.YT.Player(hostRef.current, {
        width: EMBED_SIZE.width,
        height: EMBED_SIZE.height,
        videoId: videoIdRef.current,
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            setReady(true)
          },
          onStateChange: (event) => {
            const S = window.YT.PlayerState
            const isPlaying = event.data === S.PLAYING
            setPlaying(isPlaying)
            setBuffering(event.data === S.BUFFERING)
            if (isPlaying) retriesRef.current = 0
            if (event.data === S.ENDED) endedRef.current?.()
            if (
              isPlaying ||
              event.data === S.PAUSED ||
              event.data === S.CUED ||
              event.data === S.ENDED
            ) {
              syncTime()
            }
          },
          onError: (event) => {
            setPlaying(false)
            setBuffering(false)
            if (FATAL_PLAYER_ERRORS.has(event.data)) {
              unavailableRef.current?.(event.data)
              return
            }
            // Transient decode/network hiccup — one retry, then move on.
            if (retriesRef.current < MAX_PLAYER_RETRIES) {
              retriesRef.current += 1
              playerRef.current?.playVideo?.()
            } else {
              unavailableRef.current?.(event.data)
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      playerRef.current = null
      setReady(false)
    }
  }, [syncTime])

  // ---- swap in whichever track the queue points at ----
  useEffect(() => {
    const p = playerRef.current
    if (!ready || !p || !videoId) return
    if (loadedIdRef.current === videoId) return

    loadedIdRef.current = videoId
    retriesRef.current = 0
    setTime(0)
    setDuration(fallbackDuration || 0)

    if (wantPlayRef.current) p.loadVideoById(videoId)
    else p.cueVideoById(videoId)
  }, [ready, videoId, fallbackDuration])

  // ---- progress ticker ----
  useEffect(() => {
    if (!playing) return
    const id = setInterval(syncTime, PROGRESS_TICK_MS)
    return () => clearInterval(id)
  }, [playing, syncTime])

  const play = useCallback(() => {
    wantPlayRef.current = true
    playerRef.current?.playVideo?.()
  }, [])

  const pause = useCallback(() => {
    wantPlayRef.current = false
    playerRef.current?.pauseVideo?.()
  }, [])

  const toggle = useCallback(() => {
    if (playing) pause()
    else play()
  }, [playing, play, pause])

  const seek = useCallback((seconds) => {
    playerRef.current?.seekTo?.(seconds, true)
    setTime(seconds)
  }, [])

  const nudge = useCallback(
    (delta) => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      const span = p.getDuration?.() || duration || 0
      const next = Math.min(Math.max(0, (p.getCurrentTime() || 0) + delta), Math.max(0, span - 1))
      seek(next)
    },
    [duration, seek],
  )

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p?.isMuted) return
    if (p.isMuted()) {
      p.unMute()
      setMuted(false)
    } else {
      p.mute()
      setMuted(true)
    }
  }, [])

  /** Lets the play button start a track the moment the queue advances. */
  const armAutoplay = useCallback(() => {
    wantPlayRef.current = true
  }, [])

  return {
    hostRef,
    ready,
    playing,
    buffering,
    time,
    duration,
    muted,
    play,
    pause,
    toggle,
    seek,
    nudge,
    toggleMute,
    armAutoplay,
  }
}
