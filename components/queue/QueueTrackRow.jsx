import { formatClock } from '@/lib/utils/time'

/** One row in the drawer. The current row swaps its number for equaliser bars. */
export default function QueueTrackRow({ track, slot, isCurrent, isPlaying, isBroken, onSelect }) {
  return (
    <button
      type="button"
      className={isCurrent ? 'queue-row is-current' : 'queue-row'}
      onClick={onSelect}
      aria-current={isCurrent ? 'true' : undefined}
    >
      {isCurrent ? (
        <span className={isPlaying ? 'bars' : 'bars is-paused'} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <span className="queue-num">{slot + 1}</span>
      )}
      <span className="queue-meta">
        <strong>
          {track.title}
          {isBroken ? ' ⚠' : ''}
        </strong>
        <span>
          {track.singers} · {track.film} ({track.year})
        </span>
      </span>
      <span className="queue-len">{formatClock(track.seconds)}</span>
    </button>
  )
}
