'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import TrackRow from '@/components/library/TrackRow'
import { CloseIcon, SearchIcon } from '@/components/ui/Icons'
import { DECADES } from '@/lib/constants'

/**
 * The track listing. Rows are in play order rather than playlist order, so the
 * numbers match what the queue will actually do next.
 *
 * On `lg` and up this is a permanent column; below it, <ChillOffice /> mounts the
 * same component inside a bottom sheet.
 */
export default function LibraryPanel({
  playlist,
  order,
  pointer,
  shuffle,
  playing,
  brokenIds,
  onSelect,
  onClose,
  // The column and the sheet are both mounted at once, so their shared layout
  // elements need names that don't collide.
  scope = 'library',
}) {
  const [query, setQuery] = useState('')
  const [decade, setDecade] = useState(DECADES[0].label)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const span = DECADES.find((d) => d.label === decade)

    return order
      .map((playlistIndex, slot) => ({ track: playlist[playlistIndex], playlistIndex, slot }))
      .filter(({ track }) => {
        if (span?.from && (track.year < span.from || track.year > span.to)) return false
        if (!needle) return true
        return `${track.title} ${track.singers} ${track.film} ${track.year}`
          .toLowerCase()
          .includes(needle)
      })
  }, [order, playlist, query, decade])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex-none px-4 pt-4 pb-3 lg:px-5 lg:pt-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold tracking-[-0.01em]">The Chill Queue</h2>
            <p className="mt-1 text-[11px] text-linen/52">
              {playlist.length} classics, 1970&ndash;1999 ·{' '}
              <span className={shuffle ? 'text-amber' : undefined}>
                {shuffle ? 'shuffled' : 'in order'}
              </span>
            </p>
          </div>

          {onClose ? (
            <motion.button
              type="button"
              className="ml-auto grid size-8 flex-none cursor-pointer place-items-center rounded-full border-0 bg-shell/10 text-cream transition-colors duration-200 hover:bg-shell/18 [&>svg]:size-4"
              onClick={onClose}
              aria-label="Close playlist"
              whileTap={{ scale: 0.9 }}
            >
              <CloseIcon />
            </motion.button>
          ) : null}
        </div>

        <SearchField value={query} onChange={setQuery} />

        <div className="mt-3 flex items-center gap-1.5">
          {DECADES.map((option) => {
            const active = option.label === decade
            return (
              <button
                key={option.label}
                type="button"
                className={[
                  'relative cursor-pointer rounded-full border-0 px-3 py-1.5 text-[11px] font-semibold',
                  'transition-colors duration-200',
                  active ? 'text-void' : 'bg-shell/6 text-linen/62 hover:text-cream',
                ].join(' ')}
                onClick={() => setDecade(option.label)}
                aria-pressed={active}
              >
                {active ? (
                  <motion.span
                    layoutId={`${scope}-decade-pill`}
                    className="absolute inset-0 -z-1 rounded-full bg-[linear-gradient(120deg,#ffd0a0,#ffb26b)]"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                  />
                ) : null}
                <span className="relative">{option.label}</span>
              </button>
            )
          })}

          <span className="ml-auto text-[10px] text-linen/34 tabular-nums">
            {rows.length}/{playlist.length}
          </span>
        </div>
      </header>

      <ol className="mask-fade-b min-h-0 flex-1 list-none overflow-y-auto overscroll-contain px-2 pb-6 lg:px-3">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map(({ track, playlistIndex, slot }) => (
            <motion.li
              key={track.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              <TrackRow
                scope={scope}
                track={track}
                slot={slot}
                isCurrent={slot === pointer}
                isPlaying={playing}
                isBroken={brokenIds.has(track.id)}
                onSelect={() => onSelect(playlistIndex)}
              />
            </motion.li>
          ))}
        </AnimatePresence>

        {rows.length === 0 ? (
          <motion.li
            className="px-3 py-10 text-center text-[12px] text-linen/45"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Nothing in the queue matches that.
          </motion.li>
        ) : null}
      </ol>
    </div>
  )
}

function SearchField({ value, onChange }) {
  return (
    <div className="relative mt-3.5">
      <span
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-linen/40 [&>svg]:size-[15px]"
        aria-hidden="true"
      >
        <SearchIcon />
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onChange('')
          }
        }}
        placeholder="Search song, singer or film"
        aria-label="Search the queue"
        // The native clear affordance is a blue system glyph that fights the
        // palette; it is replaced by the button below.
        className="h-10 w-full rounded-xl border border-shell/10 bg-slate/60 pr-9 pl-9 text-[12.5px] text-cream placeholder:text-linen/34 focus:border-violet/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />

      <AnimatePresence>
        {value ? (
          <motion.button
            type="button"
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-shell/10 text-linen/70 transition-colors duration-200 hover:bg-shell/18 hover:text-cream [&>svg]:size-3"
            onClick={() => onChange('')}
            aria-label="Clear search"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          >
            <CloseIcon />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
