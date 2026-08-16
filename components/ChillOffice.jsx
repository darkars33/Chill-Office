'use client'

import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import Ambience from '@/components/background/Ambience'
import LibraryPanel from '@/components/library/LibraryPanel'
import SideRail from '@/components/layout/SideRail'
import TopBar from '@/components/layout/TopBar'
import AmbienceStage from '@/components/now/AmbienceStage'
import NowPlaying from '@/components/now/NowPlaying'
import YouTubeHost from '@/components/player/YouTubeHost'
import ScreenReaderHint from '@/components/ui/ScreenReaderHint'
import Toast from '@/components/ui/Toast'
import { useChillOffice } from '@/hooks/useChillOffice'

const ease = [0.32, 0.72, 0, 1]

/**
 * The app shell. All playback state lives in `useChillOffice`; this file is the
 * arrangement — a rail, a status strip, the stage, and the track list.
 *
 * Two views share the stage. `lounge` is the default: the player and the whole
 * queue side by side. `ambience` gives the office artwork the screen and shrinks
 * playback to a pill along the bottom.
 */
export default function ChillOffice() {
  const {
    playlist,
    queue,
    player,
    track,
    toast,
    brokenIds,
    queueOpen,
    ambience,
    openQueue,
    closeQueue,
    selectView,
    skip,
    jumpTo,
    toggleShuffle,
    toggleMute,
  } = useChillOffice()

  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Every stage and list gets the same slice of playback state.
  const stage = {
    track,
    position: queue.position,
    shuffle: queue.shuffle,
    playing: player.playing,
    ready: player.ready,
    buffering: player.buffering,
    time: player.time,
    duration: player.duration,
    onSeek: player.seek,
    onToggle: player.toggle,
    onNext: () => skip(1),
    onPrevious: () => skip(-1),
    onToggleShuffle: toggleShuffle,
  }

  const list = {
    playlist,
    order: queue.order,
    pointer: queue.pointer,
    shuffle: queue.shuffle,
    playing: player.playing,
    brokenIds,
    onSelect: jumpTo,
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate flex h-dvh w-full overflow-hidden">
        <Ambience ambience={ambience} />

        <SideRail
          ambience={ambience}
          muted={player.muted}
          playing={player.playing}
          track={track}
          shortcutsOpen={shortcutsOpen}
          onSelectView={selectView}
          onToggleMute={toggleMute}
          onToggleShortcuts={() => setShortcutsOpen((open) => !open)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar
            track={track}
            playing={player.playing}
            muted={player.muted}
            ambience={ambience}
            queueCount={playlist.length}
            onOpenQueue={openQueue}
            onToggleMute={toggleMute}
            onToggleAmbience={() => selectView(!ambience)}
          />

          <div className="flex min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {ambience ? (
                <AmbienceStage key="ambience" {...stage} />
              ) : (
                <NowPlaying key="lounge" nextTrack={queue.nextTrack} {...stage} />
              )}
            </AnimatePresence>

            {/* Only the wrapper's width animates — the panel inside keeps a fixed
                width, so collapsing the column never reflows fifty rows. */}
            <motion.aside
              className="relative z-2 hidden shrink-0 overflow-hidden lg:block"
              initial={false}
              animate={{ width: ambience ? 0 : 404, opacity: ambience ? 0 : 1 }}
              transition={{ duration: 0.5, ease }}
              aria-label="Playlist"
              aria-hidden={ambience}
            >
              <div className="h-full w-[404px] pr-6 pb-8">
                <div className="glass flex h-full flex-col overflow-hidden rounded-[28px] border border-shell/10">
                  <LibraryPanel scope="column" {...list} />
                </div>
              </div>
            </motion.aside>
          </div>
        </div>

        <QueueSheet open={queueOpen} onClose={closeQueue} list={list} />

        <Toast message={toast} />
        <YouTubeHost hostRef={player.hostRef} />
        <ScreenReaderHint />
      </main>
    </MotionConfig>
  )
}

/** Below `lg` the track list is a draggable bottom sheet instead of a column. */
function QueueSheet({ open, onClose, list }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="lg:hidden">
          <motion.div
            className="fixed inset-0 z-40 bg-void/70 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          />

          <motion.aside
            className="glass fixed inset-x-0 bottom-0 z-50 flex h-[78dvh] flex-col rounded-t-[28px] border-t border-shell/12"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            // A flick or a long enough pull dismisses; anything less snaps back.
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 550) onClose()
            }}
            aria-label="Playlist"
          >
            <span
              className="mx-auto mt-3 mb-1 h-1 w-10 flex-none rounded-full bg-shell/25"
              aria-hidden="true"
            />
            <LibraryPanel scope="sheet" onClose={onClose} {...list} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
