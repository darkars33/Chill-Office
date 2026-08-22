'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  QueueIcon,
  ShuffleIcon,
  SpeakerIcon,
} from '@/components/ui/Icons'
import { formatClock } from '@/lib/utils/time'
import { thumbnailUrl } from '@/lib/utils/youtube'

const spring = { type: 'spring', stiffness: 520, damping: 30 }

const ghost = [
  'grid size-9 place-items-center rounded-lg border-0 bg-transparent p-0',
  'cursor-pointer text-graphite transition-colors duration-200 hover:text-paper',
  '[&_svg]:size-[17px]',
].join(' ')

/**
 * The desk the music is playing from.
 *
 * A real piece of furniture along the bottom of the room rather than a
 * translucent bar floating over it — wood top, lit edge, controls sunk into it.
 * It stays put while you walk between rooms, which is also literally true of
 * the audio: the same deck is feeding every floor.
 */
export default function MusicDesk({
  track,
  area,
  playing,
  ready,
  buffering,
  shuffle,
  muted,
  time,
  duration,
  queueOpen,
  onSeek,
  onToggle,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleMute,
  onOpenQueue,
}) {
  const [scrubbing, setScrubbing] = useState(null)
  const loading = !ready || (buffering && !playing)

  const total = duration || track.seconds || 0
  const shown = scrubbing ?? time
  const progress = total > 0 ? Math.min(100, (shown / total) * 100) : 0

  return (
    <section className="panel relative z-30 flex-none overflow-hidden rounded-2xl" aria-label="Now playing">
      <div className="timber absolute inset-x-0 top-0 h-1" aria-hidden="true" />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 px-3 py-3 lg:flex lg:flex-nowrap lg:gap-x-5 lg:px-5 lg:py-3.5">
        {/* What is on. */}
        <div className="flex min-w-0 items-center gap-3 lg:max-w-[320px] lg:flex-1">
          <div className="relative size-12 flex-none overflow-hidden rounded-lg shadow-[0_6px_14px_-6px_rgb(0_0_0/0.9)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={track.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={thumbnailUrl(track.id)}
                  alt=""
                  fill
                  sizes="48px"
                  draggable={false}
                  className="scale-[1.34] object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-paper" title={track.title}>
              {track.title}
            </p>
            <p className="mt-0.5 truncate text-[11.5px] text-graphite">
              {track.singers}
              <span className="text-pencil"> · {area.name}</span>
            </p>
          </div>
        </div>

        {/* The controls, sunk into the desk. On a phone they get their own row
            underneath rather than being squeezed in beside the title. */}
        <div className="col-span-2 flex min-w-0 flex-col gap-1.5 lg:col-auto lg:w-auto lg:flex-1">
          <div className="flex items-center justify-center gap-1.5">
            <motion.button
              type="button"
              className={`${ghost} ${shuffle ? 'text-[oklch(0.82_0.08_var(--hue))]' : ''}`}
              onClick={onToggleShuffle}
              aria-pressed={shuffle}
              aria-label="Shuffle rooms"
              title="Shuffle rooms (S)"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
            >
              <ShuffleIcon />
            </motion.button>

            <motion.button
              type="button"
              className={ghost}
              onClick={onPrevious}
              aria-label="Previous room"
              title="Previous room (Shift + ←)"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, x: -2 }}
              transition={spring}
            >
              <PreviousIcon />
            </motion.button>

            <motion.button
              type="button"
              className="relative grid size-11 flex-none cursor-pointer place-items-center rounded-full border-0 bg-paper p-0 text-void shadow-[0_4px_12px_-3px_rgb(0_0_0/0.8)] [&_svg]:size-[19px]"
              onClick={onToggle}
              aria-pressed={playing}
              aria-label={playing ? 'Pause' : 'Play'}
              title="Play / pause (Space)"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={spring}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    className="size-4 animate-loader rounded-full border-2 border-void/20 border-t-void/75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.span
                    key={playing ? 'pause' : 'play'}
                    className="grid place-items-center"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.14 }}
                  >
                    {playing ? <PauseIcon /> : <PlayIcon />}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              className={ghost}
              onClick={onNext}
              aria-label="Next room"
              title="Next room (Shift + →)"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, x: 2 }}
              transition={spring}
            >
              <NextIcon />
            </motion.button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-pencil tabular-nums">
              {formatClock(shown)}
            </span>
            <div className="group relative flex h-4 min-w-0 flex-1 items-center">
              <div className="inset absolute inset-x-0 h-[4px] overflow-hidden rounded-full transition-[height] duration-200 group-hover:h-[6px]">
                <div
                  className="h-full rounded-full bg-[oklch(0.78_0.08_var(--hue))]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                className="seek-range absolute inset-0"
                min="0"
                max={Math.max(1, Math.floor(total))}
                step="1"
                value={Math.floor(shown)}
                aria-label="Seek"
                onChange={(e) => setScrubbing(Number(e.target.value))}
                onPointerUp={(e) => {
                  onSeek(Number(e.currentTarget.value))
                  setScrubbing(null)
                }}
                onKeyUp={(e) => {
                  if (scrubbing === null) return
                  onSeek(Number(e.currentTarget.value))
                  setScrubbing(null)
                }}
              />
            </div>
            <span className="w-8 shrink-0 font-mono text-[10px] text-pencil tabular-nums">
              {formatClock(total)}
            </span>
          </div>
        </div>

        {/* Desk fittings. */}
        <div className="flex flex-none items-center gap-1 lg:ml-auto">
          <motion.button
            type="button"
            className={`${ghost} ${muted ? 'text-away' : ''}`}
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute' : 'Mute'}
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            <SpeakerIcon muted={muted} />
          </motion.button>

          <motion.button
            type="button"
            className={`${ghost} ${queueOpen ? 'text-paper' : ''}`}
            onClick={onOpenQueue}
            aria-expanded={queueOpen}
            aria-label="Open the queue"
            title="Queue (Q)"
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            <QueueIcon />
          </motion.button>
        </div>
      </div>
    </section>
  )
}
