'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import CoverArt from '@/components/player/CoverArt'
import SeekBar from '@/components/player/SeekBar'
import TransportControls from '@/components/player/TransportControls'
import { formatClock } from '@/lib/utils/time'

/**
 * The ambience view: the office artwork gets the whole screen and playback
 * shrinks to one pill along the bottom. Same controls as the lounge, none of the
 * furniture around them.
 */
export default function AmbienceStage({
  track,
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

  const total = duration || track.seconds || 0
  const shown = scrubbing ?? time

  const commit = (seconds) => {
    onSeek(seconds)
    setScrubbing(null)
  }

  return (
    <motion.section
      className="relative flex min-h-0 flex-1 flex-col justify-end px-4 pb-[calc(18px+env(safe-area-inset-bottom))] lg:px-8 lg:pb-9"
      aria-label="Now playing"
    >
      <motion.div
        className="glass mx-auto flex w-[min(640px,100%)] items-center gap-4 rounded-[28px] border border-shell/10 p-3.5 sm:gap-5 sm:p-4"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      >
        <div className="w-[62px] flex-none sm:w-[74px]">
          <CoverArt track={track} playing={playing} compact />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="relative h-[34px] min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={track.id}
                className="absolute inset-0 min-w-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                <strong
                  className="block truncate text-[13.5px] font-bold tracking-[-0.01em]"
                  title={track.title}
                >
                  {track.title}
                </strong>
                <span className="mt-0.5 block truncate text-[11px] text-linen/58">
                  {track.singers} · {track.film}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <SeekBar
            value={shown}
            max={total}
            isScrubbing={scrubbing !== null}
            onScrub={setScrubbing}
            onCommit={commit}
          />

          <div className="flex justify-between text-[10px] leading-none text-linen/45 tabular-nums">
            <span>{formatClock(shown)}</span>
            <span>{position}</span>
            <span>{formatClock(total)}</span>
          </div>
        </div>

        <div className="flex-none">
          <TransportControls
            playing={playing}
            ready={ready}
            buffering={buffering}
            shuffle={shuffle}
            size="sm"
            onToggle={onToggle}
            onNext={onNext}
            onPrevious={onPrevious}
            onToggleShuffle={onToggleShuffle}
          />
        </div>
      </motion.div>
    </motion.section>
  )
}
