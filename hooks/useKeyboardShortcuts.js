'use client'

import { useEffect, useRef } from 'react'
import { isTypingTarget } from '@/lib/utils/dom'

/**
 * Global shortcuts. Handlers are read through a ref so the listener binds once
 * for the life of the page instead of on every render.
 *
 * Typing targets are exempt from everything, which matters more here than in
 * most apps: the composer is always focusable and `/` is a binding.
 *
 * @param {object}   on
 * @param {Function} [on.togglePlay]   space
 * @param {Function} [on.seekForward]  →
 * @param {Function} [on.seekBackward] ←
 * @param {Function} [on.next]         ⇧ →
 * @param {Function} [on.previous]     ⇧ ←
 * @param {Function} [on.say]          /
 * @param {Function} [on.wander]       R
 * @param {Function} [on.discover]     D
 * @param {Function} [on.queue]        Q
 * @param {Function} [on.shuffle]      S
 * @param {Function} [on.escape]       esc
 */
export function useKeyboardShortcuts(on) {
  const latest = useRef(on)
  useEffect(() => {
    latest.current = on
  })

  useEffect(() => {
    const onKey = (event) => {
      const handlers = latest.current

      // Escape is the one binding that works while typing — it is how you get
      // out of the composer.
      if (event.key === 'Escape') {
        handlers.escape?.()
        return
      }

      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return

      switch (event.key) {
        case ' ':
          event.preventDefault()
          handlers.togglePlay?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) handlers.next?.()
          else handlers.seekForward?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) handlers.previous?.()
          else handlers.seekBackward?.()
          break
        case '/':
          event.preventDefault()
          handlers.say?.()
          break
        case 'r':
        case 'R':
          handlers.wander?.()
          break
        case 'd':
        case 'D':
          handlers.discover?.()
          break
        case 'q':
        case 'Q':
          handlers.queue?.()
          break
        case 's':
        case 'S':
          handlers.shuffle?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
