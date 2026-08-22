'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { IS_SIMULATED } from '@/lib/presence'
import { formatCount } from '@/lib/rooms'

/** Somebody is here. Green everywhere, the one colour a room cannot retint. */
export function LiveDot({ className = 'size-1.5' }) {
  return (
    <span className={`relative flex-none ${className}`} aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-present" />
      <motion.span
        className="absolute inset-0 rounded-full bg-present"
        animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
        transition={{ duration: 2.8, ease: 'easeOut', repeat: Infinity }}
      />
    </span>
  )
}

/**
 * A headcount that rolls rather than snaps.
 *
 * The number moving on its own is most of what makes a room feel occupied, so
 * it eases to each new value over ~600ms instead of cutting. `tabular-nums`
 * keeps the layout from jittering while it counts.
 */
export function Counter({ value, className = '' }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const frame = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const a = from.current
    const b = value
    if (a === b) return undefined

    const tick = (now) => {
      const t = Math.min(1, (now - start) / 600)
      const eased = 1 - (1 - t) ** 3 // easeOutCubic
      setShown(Math.round(a + (b - a) * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else from.current = b
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value])

  return <span className={`tabular-nums ${className}`}>{formatCount(shown)}</span>
}

/**
 * Says out loud that the people in the building are generated locally.
 *
 * This is not decoration and it is not a debug affordance — while
 * `lib/presence` is backed by the simulation, every person, message and
 * reaction in the product is invented. Showing them without saying so would be
 * the interface lying about who is in the room. It comes out when a real
 * transport goes in, and not before.
 */
export function SimulatedBadge({ className = '' }) {
  if (!IS_SIMULATED) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-away/12 px-2 py-1 ${className}`}
      title="There is no server yet. Everyone in this building is generated in your browser and is not a real person."
    >
      <span className="size-1 rounded-full bg-away" aria-hidden="true" />
      <span className="plate text-[8.5px] text-away">simulated</span>
    </span>
  )
}
