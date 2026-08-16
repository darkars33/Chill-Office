'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import CoverArt from '@/components/player/CoverArt'
import SeekBar from '@/components/player/SeekBar'
import TransportControls from '@/components/player/TransportControls'
import Visualizer from '@/components/player/Visualizer'
import { formatClock } from '@/lib/utils/time'

const enter = {
  initial: { opacity: 0, y: 22, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(10px)' },
}

const swap = { duration: 0.34, ease: [0.32, 0.72, 0, 1] }

/**
 * The centre of the lounge: sleeve, title, spectrum, seek bar and transport.
 * Owns the scrub state because both the bar and the elapsed readout have to show
 * the dragged position rather than the real one.
 */
export default function NowPlaying({
  track,
  nextTrack,
  position,
  shuffle,
  playing,
  ready,
  buffering,
  time,
  duration,
  onSeek,
  onToggle,
  onNext,
  onPrevious,
  onToggleShuffle,
}) {
  const [scrubbing, setScrubbing] = useState(null)

  // YouTube only reports a duration once it has loaded; until then use ours.
  const total = duration || track.seconds || 0
  const shown = scrubbing ?? time

  const commit = (seconds) => {
    onSeek(seconds)
    setScrubbing(null)
  }

  return (
    <motion.section
      className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 lg:px-8 lg:pb-8"
      aria-label="Now playing"
    >
      <motion.div
        className="glass flex w-full max-w-[420px] flex-col gap-5 rounded-[32px] border border-shell/10 p-6 2xl:max-w-[880px] 2xl:flex-row 2xl:items-center 2xl:gap-9 2xl:p-9"
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 180, damping: 26 }}
      >
        <div className="mx-auto w-[min(58vw,240px)] flex-none 2xl:mx-0 2xl:w-[300px]">
          <CoverArt track={track} playing={playing} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-peach/70 uppercase">
              <span className="inline-block h-px w-6 bg-[linear-gradient(90deg,#ffb26b,transparent)]" />
              {playing ? 'Now playing' : 'Paused'}
              <span className="ml-auto font-semibold tracking-[0.12em] text-linen/40 tabular-nums">
                {position}
              </span>
            </p>

            {/* Keyed on the track so every field slides out together. */}
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={track.id} {...enter} transition={swap} className="min-w-0">
                  <h1
                    className="truncate text-[clamp(22px,4.4vw,34px)] leading-[1.12] font-bold tracking-[-0.025em] text-cream"
                    title={track.title}
                  >
                    {track.title}
                  </h1>
                  <p className="mt-1.5 truncate text-[13px] text-linen/64">{track.singers}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Chip>{track.film}</Chip>
                    <Chip muted>{track.year}</Chip>
                    <Chip muted>{formatClock(track.seconds)}</Chip>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </header>

          <Visualizer playing={playing} className="h-9 opacity-80" />

          <div>
            <SeekBar
              value={shown}
              max={total}
              isScrubbing={scrubbing !== null}
              onScrub={setScrubbing}
              onCommit={commit}
            />
            <div className="mt-1 flex justify-between text-[11px] leading-none text-linen/50 tabular-nums">
              <span>{formatClock(shown)}</span>
              <span>−{formatClock(Math.max(0, total - shown))}</span>
            </div>
          </div>

          <TransportControls
            playing={playing}
            ready={ready}
            buffering={buffering}
            shuffle={shuffle}
            onToggle={onToggle}
            onNext={onNext}
            onPrevious={onPrevious}
            onToggleShuffle={onToggleShuffle}
          />

          <UpNext track={nextTrack} onClick={onNext} />
        </div>
      </motion.div>
    </motion.section>
  )
}

function Chip({ children, muted = false }) {
  return (
    <span
      className={[
        'rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
        muted
          ? 'border-shell/10 bg-shell/5 text-linen/58'
          : 'border-amber/25 bg-amber/10 text-amber',
      ].join(' ')}
    >
      {children}
    </span>
  )
}

/** A peek at whatever the queue has lined up next. Clicking it skips ahead. */
function UpNext({ track, onClick }) {
  if (!track) return null

  return (
    <motion.button
      type="button"
      className="group flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-2xl border border-shell/8 bg-shell/4 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-shell/10"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      title={`Skip to “${track.title}”`}
    >
      <span className="flex-none text-[9px] font-bold tracking-[0.16em] text-linen/40 uppercase">
        Up next
      </span>
      <span className="min-w-0 flex-1 truncate text-right text-[12px] text-linen/72 transition-colors duration-200 group-hover:text-cream">
        {track.title}
      </span>
    </motion.button>
  )
}
