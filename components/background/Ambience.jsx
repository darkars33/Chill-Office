'use client'

import { motion } from 'motion/react'
import OfficeScene from '@/components/scene/OfficeScene'

/** Position, size, colour and cadence per aurora blob. The durations are
    deliberately coprime so the three never resynchronise into a visible loop. */
const AURORA = [
  {
    tint: 'rgba(255,122,89,0.42)',
    style: { top: '-22%', left: '-14%', width: '62vw', height: '62vw' },
    duration: '26s',
    delay: '0s',
  },
  {
    tint: 'rgba(169,139,255,0.40)',
    style: { bottom: '-26%', right: '-16%', width: '68vw', height: '68vw' },
    duration: '31s',
    delay: '-9s',
  },
  {
    tint: 'rgba(255,178,107,0.26)',
    style: { top: '22%', left: '30%', width: '46vw', height: '46vw' },
    duration: '37s',
    delay: '-17s',
  },
]

const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.82\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'160\' height=\'160\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'

/**
 * The whole background stack, bottom to top: the office artwork, three drifting
 * aurora blobs, a scrim that darkens the lot, a vignette and a film grain.
 *
 * The scrim is the only thing that moves between the two views — in the lounge
 * it sits heavy so the glass panels stay readable, in ambience it lifts and
 * hands the screen back to the artwork. Only opacity and scale animate: the
 * artwork animates internally (dust motes, the flickering window), so blurring
 * or filtering it would repaint the full-screen SVG on every frame.
 */
export default function Ambience({ ambience }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: ambience ? 1 : 0.62, scale: ambience ? 1 : 1.05 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
      >
        <OfficeScene />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(165deg,rgba(7,6,11,0.74),rgba(7,6,11,0.44)_45%,rgba(12,6,20,0.82))]"
        initial={false}
        animate={{ opacity: ambience ? 0.26 : 1 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
      />

      {/* Above the scrim, not under it: screen-blended, the aurora lifts the
          darkened artwork back up rather than being swallowed by it. Blurred hard
          enough that the three blobs read as one gradient. */}
      <div className="absolute inset-0 mix-blend-screen">
        {AURORA.map((blob) => (
          <div
            key={blob.tint}
            className="absolute animate-aurora rounded-full blur-[90px] will-change-transform motion-reduce:animate-none"
            style={{
              ...blob.style,
              background: `radial-gradient(circle at 50% 50%, ${blob.tint}, transparent 68%)`,
              animationDuration: blob.duration,
              animationDelay: blob.delay,
            }}
          />
        ))}
      </div>

      {/* Vignette, then grain. Both static — one rasterisation each. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,transparent_38%,rgba(4,2,9,0.72)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }}
      />
    </div>
  )
}
