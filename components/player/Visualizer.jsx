'use client'

import { motion } from 'motion/react'

/**
 * A decorative spectrum. There is no audio graph to read — the embed is
 * cross-origin — so each bar gets its own deterministic height and cadence and
 * the eye fills in the rest.
 *
 * Deterministic rather than random so the server and client agree, and so the
 * shape is the same every visit.
 */
const BARS = Array.from({ length: 44 }, (_, i) => {
  // Three sines at unrelated periods: a rolling envelope rather than a sawtooth.
  const envelope = 0.42 + 0.3 * Math.sin(i * 0.42) + 0.18 * Math.sin(i * 1.13 + 1.7)
  return {
    peak: Math.min(1, Math.max(0.16, envelope)),
    duration: 0.62 + ((i * 7) % 9) * 0.11,
    delay: -((i * 13) % 17) * 0.09,
  }
})

export default function Visualizer({ playing, className = '' }) {
  return (
    <div
      className={`flex h-10 items-end justify-between gap-[2px] ${className}`}
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <motion.span
          key={i}
          className="min-w-[2px] flex-1 origin-bottom rounded-full bg-[linear-gradient(180deg,#ffb26b,rgba(169,139,255,0.42))]"
          style={{ height: `${bar.peak * 100}%` }}
          animate={
            playing
              ? { scaleY: [0.22, 1, 0.34, 0.86, 0.22], opacity: 1 }
              : // Paused still shows the silhouette, just flattened and dimmer.
                { scaleY: 0.34, opacity: 0.5 }
          }
          transition={
            playing
              ? {
                  duration: bar.duration * 2.6,
                  delay: bar.delay,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }
              : { duration: 0.5, ease: 'easeOut' }
          }
        />
      ))}
    </div>
  )
}
