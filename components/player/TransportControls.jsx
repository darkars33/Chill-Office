'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  ShuffleIcon,
} from '@/components/ui/Icons'

const spring = { type: 'spring', stiffness: 520, damping: 30 }

const iconButton = [
  'relative grid size-10 place-items-center rounded-full border-0 bg-transparent p-0',
  'cursor-pointer text-cream/72 transition-colors duration-200 hover:text-cream',
  '[&>svg]:size-[19px]',
].join(' ')

/** Shuffle, previous, play/pause, next. */
export default function TransportControls({
  playing,
  ready,
  buffering,
  shuffle,
  size = 'lg',
  onToggle,
  onNext,
  onPrevious,
  onToggleShuffle,
}) {
  // Show the spinner while the embed boots, and while it rebuffers from a stop.
  const loading = !ready || (buffering && !playing)
  const play = size === 'lg' ? 'size-16 [&_svg]:size-7' : 'size-12 [&_svg]:size-6'

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3">
      <motion.button
        type="button"
        className={`${iconButton} ${shuffle ? 'text-amber' : ''}`}
        onClick={onToggleShuffle}
        aria-pressed={shuffle}
        aria-label="Shuffle"
        title="Shuffle (S)"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={spring}
      >
        <ShuffleIcon />
        <AnimatePresence>
          {shuffle ? (
            <motion.span
              className="absolute bottom-[3px] size-[3px] rounded-full bg-amber"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
            />
          ) : null}
        </AnimatePresence>
      </motion.button>

      <motion.button
        type="button"
        className={iconButton}
        onClick={onPrevious}
        aria-label="Previous track"
        title="Previous (Shift + ←)"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88, x: -3 }}
        transition={spring}
      >
        <PreviousIcon />
      </motion.button>

      <motion.button
        type="button"
        className={[
          'relative grid flex-none place-items-center rounded-full border-0 p-0',
          'cursor-pointer bg-[linear-gradient(140deg,#fffaf4,#ffd9b8)] text-void',
          'shadow-[0_14px_34px_-10px_rgba(255,140,80,0.8),inset_0_1px_0_rgba(255,255,255,0.9)]',
          play,
        ].join(' ')}
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause' : 'Play'}
        title="Play / pause (Space)"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={spring}
      >
        {/* A ring that breathes out of the button while it is playing. */}
        {playing && !loading ? (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full border border-amber/60"
            animate={{ scale: [1, 1.42], opacity: [0.7, 0] }}
            transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity }}
            aria-hidden="true"
          />
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              className="size-[18px] animate-loader-spin rounded-full border-2 border-void/20 border-t-void/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
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
        className={iconButton}
        onClick={onNext}
        aria-label="Next track"
        title="Next (Shift + →)"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88, x: 3 }}
        transition={spring}
      >
        <NextIcon />
      </motion.button>
    </div>
  )
}
