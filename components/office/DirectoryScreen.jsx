'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import { Counter, LiveDot, SimulatedBadge } from '@/components/ui/Presence'
import { SignalIcon, WanderIcon, WhisperIcon } from '@/components/ui/Icons'
import { useLiveCounts } from '@/hooks/useLiveCounts'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { identityFor } from '@/lib/identity'
import { PRODUCT_NAME } from '@/lib/constants'
import { ROOMS, ROOMS_BY_AREA, formatCount } from '@/lib/rooms'
import { usePlayer } from '@/providers/PlayerProvider'

/** A few faces to stand in the doorway of each floor. Fixed seeds, so the
    building looks the same every time you walk through it. */
const DOORWAY = Array.from({ length: 6 }, (_, i) => identityFor(`doorway-${i}`))

/**
 * The directory: the whole building on one board.
 *
 * Grouped by floor rather than ranked, because the question this screen answers
 * is "where do I want to be", not "what is biggest". Each floor leads with its
 * own character and headcount, and the rooms inside it are cards you can see
 * the crowd of before you commit to walking in.
 *
 * The music from wherever you came from keeps playing the entire time. Browsing
 * the building is not leaving the room you are in.
 */
export default function DirectoryScreen() {
  const { roomId, enterPlaying, wander } = usePlayer()
  const counts = useLiveCounts(ROOMS)

  useKeyboardShortcuts({ wander })

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <main className="relative h-dvh w-full overflow-y-auto" style={{ '--hue': 32 }}>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#221c17,#141110_58%,#0d0b0a)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pt-[calc(18px+env(safe-area-inset-top))] pb-16 lg:px-8 lg:pt-8">
        <header className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <Link
              href="/"
              className="plate text-graphite no-underline transition-colors hover:text-paper"
            >
              ← Back to the floor
            </Link>
            <h1 className="display mt-3 text-[clamp(30px,5vw,52px)] text-paper">
              The building
            </h1>
            <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-graphite">
              Five floors, {ROOMS.length} rooms. Every room is one song and everybody in it is
              hearing the same second of it as you would be.
            </p>
          </div>

          <div className="flex items-center gap-3 pb-1">
            <span className="flex items-center gap-2">
              <LiveDot />
              <span className="text-[14px] text-graphite">
                <Counter value={total} className="font-mono font-medium text-paper" /> in the
                building
              </span>
            </span>
            <SimulatedBadge />
          </div>

          <motion.button
            type="button"
            onClick={wander}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-paper px-5 py-3 text-[13px] font-semibold text-void [&_svg]:size-4"
          >
            <WanderIcon />
            Put me anywhere
          </motion.button>
        </header>

        <div className="mt-10 flex flex-col gap-12">
          {ROOMS_BY_AREA.map(({ area, rooms }) => {
            const headcount = rooms.reduce((sum, r) => sum + (counts[r.id] ?? r.listeners), 0)
            return (
              <section key={area.id} id={area.id} style={{ '--hue': area.hue }}>
                <div className="flex flex-wrap items-end gap-x-5 gap-y-2 border-b border-paper/8 pb-3">
                  <span className="inset grid size-9 place-items-center rounded-lg">
                    <span className="size-2 rounded-full bg-[oklch(0.78_0.08_var(--hue))]" />
                  </span>
                  <div>
                    <h2 className="text-[20px] font-semibold text-paper">{area.name}</h2>
                    <p className="mt-0.5 text-[12.5px] text-graphite">{area.blurb}</p>
                  </div>
                  <p className="ml-auto flex items-center gap-1.5 font-mono text-[12px] text-[oklch(0.8_0.075_var(--hue))] tabular-nums [&_svg]:size-3.5">
                    <SignalIcon />
                    {formatCount(headcount)} · {rooms.length} rooms
                  </p>
                </div>

                <ul className="mt-4 grid list-none gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {rooms.map((room, i) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      index={i}
                      listeners={counts[room.id] ?? room.listeners}
                      current={room.id === roomId}
                      onEnter={enterPlaying}
                    />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}

/**
 * One room, as a doorway you can see into.
 *
 * The little crowd along the bottom is the point of the card. A headcount is a
 * number; three figures standing in a lit doorway is a place with people in it,
 * and it costs almost nothing to draw.
 */
function RoomCard({ room, index, listeners, current, onEnter }) {
  // Scale the visible crowd to the real one — a packed room shows a full
  // doorway, a quiet one shows one person on their own.
  const crowd = Math.max(1, Math.min(6, Math.round(Math.sqrt(listeners) / 4) + 1))
  const chatter = Math.max(1, Math.round(room.heat * 5))

  return (
    <motion.li
      style={{ '--hue': room.hue }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.3, index * 0.03), duration: 0.4 }}
    >
      <button
        type="button"
        onClick={() => onEnter(room.id)}
        aria-current={current ? 'true' : undefined}
        className={[
          'panel group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border-0 text-left',
          'transition-transform duration-200 hover:-translate-y-0.5',
          current ? 'ring-1 ring-[oklch(0.7_0.08_var(--hue)/0.6)]' : '',
        ].join(' ')}
      >
        <span className="flex items-start gap-3 px-4 pt-4">
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[14px] font-semibold text-paper">
              {room.track.title}
            </strong>
            <span className="mt-0.5 block truncate text-[11.5px] text-graphite">
              {room.track.singers} · {room.track.year}
            </span>
          </span>
          <span className="flex flex-none items-center gap-1 font-mono text-[11.5px] text-[oklch(0.82_0.075_var(--hue))] tabular-nums [&_svg]:size-3">
            <SignalIcon />
            {formatCount(listeners)}
          </span>
        </span>

        <span className="mt-2 flex items-center gap-1.5 px-4">
          <span className="text-pencil [&_svg]:size-3">
            <WhisperIcon />
          </span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-2 w-[3px] rounded-full ${
                i < chatter
                  ? 'bg-[oklch(0.78_0.075_var(--hue))]'
                  : 'bg-paper/10'
              }`}
            />
          ))}
          <span className="ml-1 font-mono text-[10px] text-pencil">conversation</span>
        </span>

        {/* The doorway. */}
        <span className="relative mt-3 flex h-[72px] items-end justify-center gap-1 overflow-hidden bg-[linear-gradient(to_bottom,transparent,oklch(0.4_0.05_var(--hue)/0.22))] px-4">
          <span className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,oklch(0.7_0.08_var(--hue)/0.5),transparent)]" />
          {DOORWAY.slice(0, crowd).map((person, i) => (
            <span
              key={person.id}
              className="relative text-[oklch(0.42_0.04_var(--hue))] transition-transform duration-300 group-hover:-translate-y-0.5"
              style={{
                '--hue': `calc(var(--room-hue, ${room.hue}) + ${person.tint})`,
                transitionDelay: `${i * 40}ms`,
                opacity: 0.55 + (i % 3) * 0.18,
              }}
            >
              <Persona
                seed={person.seed + index}
                seated={i % 3 === 0}
                className={i % 2 ? 'h-10' : 'h-12'}
              />
            </span>
          ))}
        </span>
      </button>
    </motion.li>
  )
}
