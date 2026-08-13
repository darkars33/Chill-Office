'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TOAST_DURATION_MS } from '@/lib/constants'

/** One transient status line at a time. A new message replaces the old one. */
export function useToast(duration = TOAST_DURATION_MS) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const notify = useCallback(
    (text) => {
      setMessage(text)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setMessage(''), duration)
    },
    [duration],
  )

  useEffect(() => () => clearTimeout(timer.current), [])

  return { message, notify }
}
