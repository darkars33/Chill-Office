'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import ActivityColumn from '@/components/office/ActivityColumn'
import MusicDesk from '@/components/office/MusicDesk'
import MyDeskPanel from '@/components/office/MyDeskPanel'
import NavRail from '@/components/office/NavRail'
import QueuePanel from '@/components/office/QueuePanel'
import RoomStage from '@/components/office/RoomStage'
import { Counter, LiveDot, SimulatedBadge } from '@/components/ui/Presence'
import { ActivityIcon, CompassIcon, DeskIcon, WanderIcon } from '@/components/ui/Icons'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLiveCounts } from '@/hooks/useLiveCounts'
import { areaById } from '@/lib/areas'
import { SEEK_STEP_SECONDS, SHORTCUTS } from '@/lib/constants'
import { ROOMS, formatCount, neighboursOf } from '@/lib/rooms'
import { usePlayer } from '@/providers/PlayerProvider'
import { usePresence } from '@/providers/PresenceProvider'

/**
 * The workspace: one screen that is the whole product.
 *
 * Three columns of furniture — the directory board on the left, the room in the
 * middle, the conversation on the right — with the music desk running along the
 * bottom underneath all of it. Nothing here is a page that replaces another
 * page; walking to a different room swaps what is on the middle column and
 * retints the light, and everything else stays exactly where it was, because
 * you have not left the building.
 *
 * Below `lg` the columns become a stack: the room first, then conversation,
 * with the desk pinned to the bottom edge. The floor is still a floor — it just
 * has less of it.
 *
 * @param {object} props
 * @param {string} [props.roomId] from the URL; the tuner adopts it on mount
 */
export default function WorkspaceScreen({ roomId }) {
  const router = useRouter()
  const {
    room,
    track,
    player,
    shuffle,
    history,
    adopt,
    enterPlaying,
    wander,
    next,
    previous,
    toggleShuffle,
  } = usePlayer()
  const presence = usePresence()

  const [queueOpen, setQueueOpen] = useState(false)
  const [deskOpen, setDeskOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(true)
  const composerRef = useRef(null)

  const counts = useLiveCounts(ROOMS)
  const compact = useMediaQuery('(max-width: 1023px)')
  const area = areaById(room.areaId)
  const neighbours = useMemo(() => neighboursOf(room.id), [room.id])

  // The URL is the source of truth for which room you are in, so deep links and
  // the back button both work without the tuner having to parse routes itself.
  useEffect(() => {
    if (roomId) adopt(roomId)
  }, [roomId, adopt])

  useKeyboardShortcuts({
    togglePlay: player.toggle,
    seekForward: () => player.nudge(SEEK_STEP_SECONDS),
    seekBackward: () => player.nudge(-SEEK_STEP_SECONDS),
    next,
    previous,
    shuffle: toggleShuffle,
    wander,
    discover: () => router.push('/directory'),
    say: () => composerRef.current?.focus(),
    queue: () => setQueueOpen((open) => !open),
    escape: () => {
      if (queueOpen) setQueueOpen(false)
      else if (deskOpen) setDeskOpen(false)
      else composerRef.current?.blur()
    },
  })

  const unshown = Math.max(0, presence.total - presence.people.length)

  return (
    <main
      className="relative flex h-dvh w-full flex-col gap-3 overflow-hidden p-3 transition-[--hue] duration-700 lg:gap-4 lg:p-4"
      // `--room-hue` is the room's colour; `--hue` is what a given subtree is
      // painted in. They start equal and each person offsets from the former.
      style={{ '--room-hue': room.hue, '--hue': room.hue }}
    >
      <Building />

      <div className="relative z-10 flex min-h-0 flex-1 gap-3 lg:gap-4">
        <NavRail
          self={presence.self}
          area={area}
          neighbours={neighbours}
          counts={counts}
          currentId={room.id}
          activityOpen={activityOpen}
          onEnter={enterPlaying}
          onWander={wander}
          onOpenDesk={() => setDeskOpen(true)}
          onToggleActivity={() => setActivityOpen((open) => !open)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:gap-4">
          <FloorHeader
            room={room}
            area={area}
            track={track}
            total={presence.total}
            unshown={unshown}
            onWander={wander}
            onOpenDesk={() => setDeskOpen(true)}
            onToggleActivity={() => setActivityOpen((open) => !open)}
          />

          <div className="flex min-h-0 flex-1 gap-3 lg:gap-4">
            <div className="min-h-0 min-w-0 flex-1">
              <RoomStage
                area={area}
                track={track}
                playing={player.playing}
                people={presence.people}
                messages={presence.messages}
                reactions={presence.reactions}
                total={presence.total}
                // A phone has a fraction of the floor area, so it gets a
                // fraction of the crowd. The headcount still says how many are
                // really in there.
                peopleLimit={compact ? 8 : undefined}
                onWhisper={presence.openWhisper}
              />
            </div>

            <AnimatePresence initial={false}>
              {activityOpen ? (
                <motion.div
                  key="activity"
                  className="hidden min-h-0 lg:block"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 326, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="h-full w-[326px]">
                    <ActivityColumn
                      messages={presence.messages}
                      activity={presence.activity}
                      whispers={presence.whispers}
                      self={presence.self}
                      composerRef={composerRef}
                      onSay={presence.say}
                      onReact={presence.react}
                      onWhisper={presence.openWhisper}
                      onSendWhisper={presence.sendWhisper}
                      onCloseWhisper={presence.closeWhisper}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* On a phone the conversation sits under the room instead of beside
              it — same column, different axis, and a fixed slice of the height
              so the room above it always keeps enough floor to be a room. */}
          <div className="h-[31dvh] flex-none lg:hidden">
            <ActivityColumn
              messages={presence.messages}
              activity={presence.activity}
              whispers={presence.whispers}
              self={presence.self}
              onSay={presence.say}
              onReact={presence.react}
              onWhisper={presence.openWhisper}
              onSendWhisper={presence.sendWhisper}
              onCloseWhisper={presence.closeWhisper}
            />
          </div>
        </div>
      </div>

      <MusicDesk
        track={track}
        area={area}
        playing={player.playing}
        ready={player.ready}
        buffering={player.buffering}
        shuffle={shuffle}
        muted={player.muted}
        time={player.time}
        duration={player.duration || track.seconds}
        queueOpen={queueOpen}
        onSeek={player.seek}
        onToggle={player.toggle}
        onNext={next}
        onPrevious={previous}
        onToggleShuffle={toggleShuffle}
        onToggleMute={player.toggleMute}
        onOpenQueue={() => setQueueOpen((open) => !open)}
      />

      <QueuePanel
        open={queueOpen}
        currentId={room.id}
        history={history}
        counts={counts}
        onPick={(id) => {
          enterPlaying(id)
          setQueueOpen(false)
        }}
        onClose={() => setQueueOpen(false)}
      />

      <MyDeskPanel open={deskOpen} self={presence.self} onClose={() => setDeskOpen(false)} />

      <p className="sr-only">
        {`You are in ${area.name}, listening to ${track.title}. ${presence.total} people are here; ${presence.people.length} are drawn on the floor. Shortcuts: ${SHORTCUTS.map(([k, w]) => `${k} — ${w}`).join('. ')}.`}
      </p>
    </main>
  )
}

/**
 * The building the panels are standing in.
 *
 * A fixed, unmoving warm shell behind everything — no animation, no blur, no
 * blend modes. It exists so the gaps between panels read as the room the
 * furniture is in rather than as page background.
 */
function Building() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#221c17,#141110_58%,#0d0b0a)]" />
      <div className="absolute inset-0 animate-lamp bg-[radial-gradient(70%_60%_at_50%_0%,oklch(0.55_0.06_var(--hue)/0.3),transparent_68%)] motion-reduce:animate-none" />
    </div>
  )
}

/** The sign above the door: which floor, what is on, how many people. */
function FloorHeader({ room, area, track, total, unshown, onWander, onOpenDesk, onToggleActivity }) {
  return (
    <header className="panel relative z-20 flex flex-none flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2">
          <span className="plate text-[oklch(0.8_0.075_var(--hue))]">{area.name}</span>
          <span className="text-pencil">·</span>
          <span className="plate text-pencil">Room {room.id.slice(0, 4).toUpperCase()}</span>
        </p>
        <h1 className="display mt-1 truncate text-[clamp(17px,2.2vw,24px)] text-paper">
          {track.title}
        </h1>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-[13px]">
          <LiveDot />
          <Counter value={total} className="font-mono font-medium text-paper" />
          <span className="text-graphite">here</span>
          {unshown > 0 ? (
            <span className="hidden font-mono text-[10.5px] text-pencil sm:inline">
              ({formatCount(unshown)} out of frame)
            </span>
          ) : null}
        </p>

        <div className="flex items-center gap-1 lg:hidden">
          <SimulatedBadge />
          <HeaderButton onClick={onOpenDesk} label="My desk">
            <DeskIcon />
          </HeaderButton>
          <HeaderButton onClick={onToggleActivity} label="Activity">
            <ActivityIcon />
          </HeaderButton>
          <HeaderButton onClick={onWander} label="Walk somewhere else">
            <WanderIcon />
          </HeaderButton>
          <Link
            href="/directory"
            aria-label="Directory"
            className="grid size-9 place-items-center rounded-lg bg-paper/6 text-chalk no-underline transition-colors duration-200 hover:text-paper [&_svg]:size-[17px]"
          >
            <CompassIcon />
          </Link>
        </div>

        <span className="hidden lg:block">
          <SimulatedBadge />
        </span>
      </div>
    </header>
  )
}

function HeaderButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 cursor-pointer place-items-center rounded-lg border-0 bg-paper/6 p-0 text-chalk transition-colors duration-200 hover:text-paper [&_svg]:size-[17px]"
    >
      {children}
    </button>
  )
}
