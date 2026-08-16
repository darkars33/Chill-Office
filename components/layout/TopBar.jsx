'use client'

import { AnimatePresence, motion } from 'motion/react'
import { QueueIcon, SparkleIcon, SpeakerIcon, YouTubeIcon } from '@/components/ui/Icons'
import { useClock } from '@/hooks/useClock'
import { clockParts } from '@/lib/utils/time'
import { watchUrl } from '@/lib/utils/youtube'

const iconButton = [
  'relative inline-flex items-center gap-2 rounded-full border border-shell/10',
  'cursor-pointer bg-shell/6 px-3 py-2 text-[12px] font-semibold text-cream/88',
  'backdrop-blur-xl transition-colors duration-200 hover:bg-shell/12',
  // `_` rather than `>` because the mute button wraps its icon in a tint span.
  '[&_svg]:size-[17px]',
].join(' ')

const spring = { type: 'spring', stiffness: 460, damping: 32 }

/**
 * The status strip across the top: local time and what the office is doing at
 * this hour on the left, the current film in the middle, and — below `lg`, where
 * the rail is hidden — the queue, mute and YouTube controls on the right.
 */
export default function TopBar({
  track,
  playing,
  muted,
  ambience,
  queueCount,
  onOpenQueue,
  onToggleMute,
  onToggleAmbience,
}) {
  return (
    <header className="relative z-3 flex items-center gap-3 px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-2 lg:px-6 lg:pt-6 lg:pb-3">
      <Clock />

      <FilmLine track={track} playing={playing} />

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <motion.button
          type="button"
          className={iconButton}
          onClick={onOpenQueue}
          // The label is dropped on the narrowest layout, so the button needs a
          // name of its own to fall back on.
          aria-label={`Open the queue, ${queueCount} tracks`}
          whileTap={{ scale: 0.94 }}
          transition={spring}
        >
          <QueueIcon />
          <span className="hidden pill:inline" aria-hidden="true">
            Queue · {queueCount}
          </span>
        </motion.button>

        <motion.button
          type="button"
          className={iconButton}
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute' : 'Mute'}
          whileTap={{ scale: 0.94 }}
          transition={spring}
        >
          <span className={muted ? 'text-ember' : undefined}>
            <SpeakerIcon muted={muted} />
          </span>
        </motion.button>

        <motion.button
          type="button"
          className={`${iconButton} ${ambience ? 'border-amber/30 bg-amber/14 text-amber' : ''}`}
          onClick={onToggleAmbience}
          aria-pressed={ambience}
          aria-label="Ambience view"
          whileTap={{ scale: 0.94 }}
          transition={spring}
        >
          <SparkleIcon />
        </motion.button>

        <motion.a
          href={watchUrl(track.id)}
          className={`${iconButton} hidden pill:inline-flex`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open “${track.title}” on YouTube`}
          whileTap={{ scale: 0.94 }}
          transition={spring}
        >
          <YouTubeIcon />
        </motion.a>
      </div>
    </header>
  )
}

/** Local time and the shift label. Renders nothing until the browser has told us
    what time it is — the server has no idea, and would hydrate mismatched. */
function Clock() {
  const now = useClock()
  const parts = now && clockParts(now)

  return (
    <div className="flex min-w-[104px] flex-col gap-[3px] leading-none text-shadow-chrome">
      {parts ? (
        <>
          <time
            dateTime={now.toISOString()}
            className="text-[15px] font-bold tracking-[-0.02em] text-cream/95 tabular-nums"
          >
            {parts.hh}
            <span className="inline-block animate-clock-blink motion-reduce:animate-none">:</span>
            {parts.mm}
            <span className="ml-1 text-[11px] text-linen/55">{parts.meridiem}</span>
          </time>
          <small className="text-[10px] font-semibold tracking-[0.14em] text-peach/72 uppercase">
            {parts.shift}
          </small>
        </>
      ) : (
        <span className="h-[30px]" aria-hidden="true" />
      )}
    </div>
  )
}

/** Which film the current song is from, with a live/paused dot. Swaps with a
    slide whenever the track changes. */
function FilmLine({ track, playing }) {
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center gap-2.5 pill:flex">
      <span
        className={[
          'size-[7px] flex-none rounded-full',
          playing
            ? 'bg-live shadow-[0_0_12px_rgba(61,220,151,0.9)]'
            : 'bg-ember shadow-[0_0_12px_rgba(255,122,89,0.85)]',
        ].join(' ')}
        aria-hidden="true"
      >
        {playing ? (
          <motion.span
            className="block size-full rounded-full bg-live"
            animate={{ scale: [1, 1.9, 1], opacity: [0.9, 0, 0.9] }}
            transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity }}
          />
        ) : null}
      </span>

      <div className="relative h-4 min-w-0 max-w-[46vw] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={track.id}
            className="truncate text-[12.5px] leading-4 font-semibold text-cream/86 text-shadow-chrome"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            {track.film}
            <span className="text-linen/45"> · {track.year}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
