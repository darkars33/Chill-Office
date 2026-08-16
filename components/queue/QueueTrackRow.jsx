import { formatClock } from '@/lib/utils/time'

const row = [
  'grid w-full grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-[11px]',
  'cursor-pointer rounded-xl border-0 px-2.5 py-[9px] text-left text-inherit',
  'transition-colors duration-[140ms]',
].join(' ')

// Equaliser bars: height and phase per bar, so they don't pump in unison.
const BARS = [
  { height: '60%', animationDelay: '-0.2s' },
  { height: '100%', animationDelay: '-0.55s' },
  { height: '45%', animationDelay: '-0.9s' },
]

/** One row in the drawer. The current row swaps its number for equaliser bars. */
export default function QueueTrackRow({ track, slot, isCurrent, isPlaying, isBroken, onSelect }) {
  return (
    <button
      type="button"
      // The current row keeps its tint on hover, so it doesn't lose its place.
      className={`${row} ${isCurrent ? 'bg-ember/16' : 'bg-transparent hover:bg-linen/8'}`}
      onClick={onSelect}
      aria-current={isCurrent ? 'true' : undefined}
    >
      {isCurrent ? (
        <span className="flex h-[13px] items-end gap-0.5" aria-hidden="true">
          {BARS.map((bar) => (
            <i
              key={bar.animationDelay}
              className={[
                'w-[2.5px] animate-equaliser rounded-[1px] bg-amber motion-reduce:animate-none',
                isPlaying ? '' : '[animation-play-state:paused]',
              ].join(' ')}
              style={bar}
            />
          ))}
        </span>
      ) : (
        <span className="text-right text-[11px] text-linen/45 tabular-nums">{slot + 1}</span>
      )}
      <span className="min-w-0">
        <strong className="block truncate text-[13px] [font-weight:650]">
          {track.title}
          {isBroken ? ' ⚠' : ''}
        </strong>
        <span className="mt-0.5 block truncate text-[11px] text-linen/58">
          {track.singers} · {track.film} ({track.year})
        </span>
      </span>
      <span className="text-[11px] text-linen/45 tabular-nums">{formatClock(track.seconds)}</span>
    </button>
  )
}
