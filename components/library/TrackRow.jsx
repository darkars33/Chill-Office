'use client'

import { motion } from 'motion/react'
import { PlayIcon } from '@/components/ui/Icons'
import { formatClock } from '@/lib/utils/time'

// Equaliser bars: height and phase per bar, so they don't pump in unison.
const BARS = [
  { height: '55%', animationDelay: '-0.2s' },
  { height: '100%', animationDelay: '-0.55s' },
  { height: '42%', animationDelay: '-0.9s' },
]

/**
 * One row of the track list. The current row swaps its number for an equaliser
 * and keeps a lit backing; every other row reveals a play glyph on hover.
 */
export default function TrackRow({
  track,
  slot,
  isCurrent,
  isPlaying,
  isBroken,
  onSelect,
  scope,
}) {
  return (
    <motion.button
      type="button"
      layout="position"
      className={[
        'group relative grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3',
        'cursor-pointer rounded-2xl border-0 px-3 py-2.5 text-left text-inherit',
        'transition-colors duration-200',
        isCurrent ? 'bg-transparent' : 'bg-transparent hover:bg-shell/8',
      ].join(' ')}
      onClick={onSelect}
      aria-current={isCurrent ? 'true' : undefined}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 520, damping: 36 }}
    >
      {isCurrent ? (
        <motion.span
          layoutId={`${scope}-active-row`}
          className="pointer-events-none absolute inset-0 -z-1 rounded-2xl border border-amber/20 bg-[linear-gradient(100deg,rgba(255,178,107,0.2),rgba(169,139,255,0.1))]"
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        />
      ) : null}

      <span className="relative grid h-[15px] place-items-center">
        {isCurrent ? (
          <span className="flex h-[15px] items-end gap-[2px]" aria-hidden="true">
            {BARS.map((bar) => (
              <i
                key={bar.animationDelay}
                className="w-[2.5px] animate-equaliser rounded-full bg-amber motion-reduce:animate-none"
                style={{ ...bar, animationPlayState: isPlaying ? 'running' : 'paused' }}
              />
            ))}
          </span>
        ) : (
          // The number and the play glyph share the cell and cross-fade.
          <>
            <span className="absolute text-[11px] text-linen/38 tabular-nums transition-opacity duration-150 group-hover:opacity-0">
              {slot + 1}
            </span>
            <span
              className="absolute text-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100 [&>svg]:size-[14px]"
              aria-hidden="true"
            >
              <PlayIcon />
            </span>
          </>
        )}
      </span>

      <span className="min-w-0">
        <strong
          className={[
            'block truncate text-[13px] font-semibold',
            isCurrent ? 'text-cream' : 'text-cream/88',
          ].join(' ')}
        >
          {track.title}
          {isBroken ? <span title="YouTube would not play this one"> ⚠</span> : null}
        </strong>
        <span className="mt-0.5 block truncate text-[11px] text-linen/52">
          {track.singers} · {track.film} ({track.year})
        </span>
      </span>

      <span className="text-[11px] text-linen/38 tabular-nums">{formatClock(track.seconds)}</span>
    </motion.button>
  )
}
