'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CloseIcon, SearchIcon, SignalIcon } from '@/components/ui/Icons'
import { areaById } from '@/lib/areas'
import { ROOMS, formatCount, roomById } from '@/lib/rooms'
import { formatClock } from '@/lib/utils/time'

/**
 * What else is on, everywhere in the building.
 *
 * Framed as rooms rather than as a tracklist: every line leads with the space
 * it is in and how many people are in it, because that is what you are actually
 * choosing between. Rooms you have already been in come first, so walking back
 * somewhere you liked is one glance rather than a search.
 */
export default function QueuePanel({ open, currentId, history, counts, onPick, onClose }) {
  const [query, setQuery] = useState('')

  const recent = useMemo(() => history.map(roomById).filter(Boolean).slice(0, 4), [history])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return ROOMS
    return ROOMS.filter((room) =>
      `${room.track.title} ${room.track.singers} ${room.track.film} ${room.track.year} ${areaById(room.areaId).name}`
        .toLowerCase()
        .includes(needle),
    )
  }, [query])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-void/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            aria-hidden="true"
          />

          <motion.aside
            className="panel-float fixed inset-x-3 bottom-3 z-50 flex max-h-[76dvh] flex-col overflow-hidden rounded-2xl lg:inset-y-4 lg:right-4 lg:left-auto lg:max-h-none lg:w-[400px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            aria-label="Rooms"
          >
            <header className="flex-none px-5 pt-5">
              <div className="flex items-start gap-3">
                <div>
                  <p className="plate text-pencil">Everywhere else</p>
                  <h2 className="display mt-1.5 text-[22px] text-paper">
                    {ROOMS.length} rooms, five floors
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-auto grid size-8 flex-none cursor-pointer place-items-center rounded-full border-0 bg-paper/6 p-0 text-chalk transition-colors duration-200 hover:text-paper [&_svg]:size-4"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="relative mt-4">
                <span
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-pencil [&_svg]:size-[15px]"
                  aria-hidden="true"
                >
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation()
                      setQuery('')
                    }
                  }}
                  placeholder="Search a song, singer, film or floor"
                  aria-label="Search rooms"
                  className="inset h-11 w-full rounded-xl pr-4 pl-10 text-[13px] text-paper placeholder:text-pencil focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
            </header>

            <div className="mask-fade-b mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
              {recent.length > 0 && !query ? (
                <Section title="Rooms you have been in">
                  {recent.map((room) => (
                    <Line
                      key={`recent-${room.id}`}
                      room={room}
                      listeners={counts[room.id] ?? room.listeners}
                      current={room.id === currentId}
                      onPick={onPick}
                    />
                  ))}
                </Section>
              ) : null}

              <Section title={query ? `${results.length} matches` : 'Every room'}>
                {results.map((room) => (
                  <Line
                    key={room.id}
                    room={room}
                    listeners={counts[room.id] ?? room.listeners}
                    current={room.id === currentId}
                    onPick={onPick}
                  />
                ))}
                {results.length === 0 ? (
                  <p className="px-3 py-10 text-center text-[13px] text-graphite/70">
                    Nothing matches that. Try a singer, or just walk somewhere.
                  </p>
                ) : null}
              </Section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="plate px-3 pb-2 text-pencil">{title}</h3>
      {children}
    </section>
  )
}

function Line({ room, listeners, current, onPick }) {
  const area = areaById(room.areaId)

  return (
    <motion.button
      type="button"
      className={[
        'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-left',
        'cursor-pointer border-0 transition-colors duration-200',
        current ? 'bg-[oklch(0.6_0.075_var(--hue)/0.2)]' : 'bg-transparent hover:bg-paper/5',
      ].join(' ')}
      style={{ '--hue': room.hue }}
      onClick={() => onPick(room.id)}
      whileTap={{ scale: 0.99 }}
      aria-current={current ? 'true' : undefined}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span
            className="size-1.5 flex-none rounded-full bg-[oklch(0.76_0.08_var(--hue))]"
            aria-hidden="true"
          />
          <strong className="truncate text-[13.5px] font-semibold text-paper/92">
            {room.track.title}
          </strong>
        </span>
        <span className="mt-0.5 block truncate pl-3.5 text-[11.5px] text-graphite">
          {area.name}
          <span className="text-pencil"> · {room.track.singers}</span>
        </span>
      </span>

      <span className="flex flex-none flex-col items-end gap-0.5">
        <span className="flex items-center gap-1 font-mono text-[11px] text-[oklch(0.82_0.07_var(--hue))] tabular-nums [&_svg]:size-3">
          <SignalIcon />
          {formatCount(listeners)}
        </span>
        <span className="font-mono text-[10px] text-pencil tabular-nums">
          {formatClock(room.track.seconds)}
        </span>
      </span>
    </motion.button>
  )
}
