'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  DiscIcon,
  KeyboardIcon,
  SparkleIcon,
  SpeakerIcon,
  YouTubeIcon,
} from '@/components/ui/Icons'
import { SHORTCUTS } from '@/lib/constants'
import { watchUrl } from '@/lib/utils/youtube'

const railButton = [
  'relative grid size-11 place-items-center rounded-2xl',
  'cursor-pointer border-0 bg-transparent p-0 text-linen/62',
  'transition-colors duration-200 hover:text-cream',
  // `_` rather than `>` because a couple of these wrap their icon in a tint span.
  '[&_svg]:relative [&_svg]:z-1 [&_svg]:size-[21px]',
].join(' ')

const spring = { type: 'spring', stiffness: 480, damping: 34 }

/**
 * The 78px navigation rail down the left edge, desktop only. Holds the two views
 * (lounge and ambience), the mute toggle, a link out to YouTube and the shortcut
 * sheet. Below `lg` its controls move into <TopBar />.
 */
export default function SideRail({
  ambience,
  muted,
  playing,
  track,
  shortcutsOpen,
  onSelectView,
  onToggleMute,
  onToggleShortcuts,
}) {
  return (
    <nav
      className="relative z-3 hidden w-[78px] shrink-0 flex-col items-center gap-1 py-5 lg:flex"
      aria-label="Views and options"
    >
      {/* The rail's own backing, which dissolves in ambience so the artwork runs
          edge to edge. */}
      <motion.div
        className="glass pointer-events-none absolute inset-y-3 left-3 -z-1 w-[62px] rounded-[26px]"
        initial={false}
        animate={{ opacity: ambience ? 0 : 1, scale: ambience ? 0.94 : 1 }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      />

      <BrandMark playing={playing} />

      <div className="mt-4 flex flex-col items-center gap-1">
        <RailTab
          label="Lounge"
          hint="The full room — now playing and the whole queue"
          active={!ambience}
          onClick={() => onSelectView(false)}
        >
          <DiscIcon />
        </RailTab>
        <RailTab
          label="Ambience"
          hint="Just the artwork and a small player (V)"
          active={ambience}
          onClick={() => onSelectView(true)}
        >
          <SparkleIcon />
        </RailTab>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1">
        <motion.button
          type="button"
          className={railButton}
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute (M)' : 'Mute (M)'}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
        >
          <span className={muted ? 'text-ember' : undefined}>
            <SpeakerIcon muted={muted} />
          </span>
        </motion.button>

        <motion.a
          href={watchUrl(track.id)}
          className={railButton}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open “${track.title}” on YouTube`}
          title="Open on YouTube"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
        >
          <YouTubeIcon />
        </motion.a>

        <div className="relative">
          <motion.button
            type="button"
            className={`${railButton} ${shortcutsOpen ? 'text-cream' : ''}`}
            onClick={onToggleShortcuts}
            aria-expanded={shortcutsOpen}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            <KeyboardIcon />
          </motion.button>

          <AnimatePresence>
            {shortcutsOpen ? <ShortcutSheet /> : null}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

/** One view tab. The lit backing is a single shared element that slides between
    the tabs rather than two that cross-fade. */
function RailTab({ label, hint, active, onClick, children }) {
  return (
    <motion.button
      type="button"
      className={`${railButton} ${active ? 'text-cream' : ''}`}
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      aria-label={label}
      title={hint}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
    >
      {active ? (
        <motion.span
          layoutId="rail-active"
          className="absolute inset-0 rounded-2xl bg-[linear-gradient(140deg,rgba(255,178,107,0.28),rgba(169,139,255,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      ) : null}
      {children}
    </motion.button>
  )
}

/** Spinning wordmark disc. Doubles as a playing indicator. */
function BrandMark({ playing }) {
  return (
    <div className="grid place-items-center" title="Chill Office">
      <div className="relative grid size-10 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ffb26b,#ff7a59,#a98bff,#ffb26b)]"
          animate={{ rotate: 360 }}
          transition={{ duration: playing ? 8 : 26, ease: 'linear', repeat: Infinity }}
        />
        <span className="absolute inset-[3px] rounded-full bg-void/86" />
        <span className="relative size-[7px] rounded-full bg-cream/90" />
      </div>
      <span className="mt-2 text-[9px] leading-[1.15] font-bold tracking-[0.16em] text-linen/50 uppercase">
        Chill
        <br />
        Office
      </span>
    </div>
  )
}

/** The shortcut list, as a popover off the rail. */
function ShortcutSheet() {
  return (
    <motion.div
      className="glass absolute bottom-0 left-[calc(100%+14px)] z-5 w-64 rounded-2xl border border-shell/12 p-4"
      initial={{ opacity: 0, x: -8, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
    >
      <p className="mb-3 text-[10px] font-bold tracking-[0.18em] text-peach/70 uppercase">
        Keyboard
      </p>
      <dl className="flex flex-col gap-2">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={what} className="flex items-center gap-3 text-[12px]">
            <dt className="flex-none rounded-md bg-shell/10 px-2 py-1 font-semibold text-cream/90 tabular-nums">
              {keys}
            </dt>
            <dd className="min-w-0 flex-1 text-right text-linen/62">{what}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  )
}
