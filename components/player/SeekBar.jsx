'use client'

import { motion } from 'motion/react'

/**
 * Range input styled as a progress bar. Dragging reports through `onScrub` and
 * only commits on release, so the ticking player clock can't fight the thumb.
 *
 * The visible bar and the input are two separate layers: the input keeps its
 * native keyboard and pointer behaviour with a transparent track, and the
 * gradient underneath is what the eye actually follows.
 */
export default function SeekBar({ value, max, isScrubbing, onScrub, onCommit }) {
  const progress = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="group relative flex h-6 w-full items-center">
      <div className="absolute inset-x-0 h-[5px] overflow-hidden rounded-full bg-shell/12 transition-[height] duration-200 group-hover:h-[7px]">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#ffb26b,#ff7a59_58%,#a98bff)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          // Scrubbing has to track the pointer exactly; the ticking clock can
          // afford to be eased into place.
          transition={isScrubbing ? { duration: 0 } : { duration: 0.25, ease: 'linear' }}
        />
      </div>

      <input
        type="range"
        className="seek-range absolute inset-0"
        min="0"
        max={Math.max(1, Math.floor(max))}
        step="1"
        value={Math.floor(value)}
        aria-label="Seek"
        onChange={(e) => onScrub(Number(e.target.value))}
        onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
        onKeyUp={(e) => {
          if (isScrubbing) onCommit(Number(e.currentTarget.value))
        }}
      />
    </div>
  )
}
