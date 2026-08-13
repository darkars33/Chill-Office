'use client'

import { useEffect, useRef } from 'react'
import { isTypingTarget } from '@/lib/utils/dom'

/**
 * Global playback shortcuts. Handlers are read through a ref so the listener is
 * bound once for the life of the page instead of on every render.
 *
 * @param {object}   handlers
 * @param {Function} [handlers.onTogglePlay]     space
 * @param {Function} [handlers.onSeekForward]    right arrow
 * @param {Function} [handlers.onSeekBackward]   left arrow
 * @param {Function} [handlers.onNext]           shift + right arrow
 * @param {Function} [handlers.onPrevious]       shift + left arrow
 * @param {Function} [handlers.onToggleMute]     M
 * @param {Function} [handlers.onToggleShuffle]  S
 * @param {Function} [handlers.onToggleQueue]    Q
 * @param {Function} [handlers.onCloseQueue]     escape
 */
export function useKeyboardShortcuts(handlers) {
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    const onKey = (event) => {
      // Leave form fields and browser/OS chords alone.
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey) return
      const on = latest.current

      switch (event.key) {
        case ' ':
          event.preventDefault()
          on.onTogglePlay?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) on.onNext?.()
          else on.onSeekForward?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) on.onPrevious?.()
          else on.onSeekBackward?.()
          break
        case 'm':
        case 'M':
          on.onToggleMute?.()
          break
        case 's':
        case 'S':
          on.onToggleShuffle?.()
          break
        case 'q':
        case 'Q':
          on.onToggleQueue?.()
          break
        case 'Escape':
          on.onCloseQueue?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
