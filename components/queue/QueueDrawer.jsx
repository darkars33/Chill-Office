import QueueTrackRow from '@/components/queue/QueueTrackRow'

/** Slide-over playlist. Rows are listed in play order, not playlist order. */
export default function QueueDrawer({
  open,
  playlist,
  order,
  pointer,
  shuffle,
  playing,
  brokenIds,
  onClose,
  onSelect,
}) {
  return (
    <aside className={open ? 'queue is-open' : 'queue'} aria-label="Playlist" aria-hidden={!open}>
      <div className="queue-head">
        <div>
          <h2>The Chill Queue</h2>
          <p>
            {playlist.length} classics, 1970&ndash;1999 · {shuffle ? 'shuffled' : 'in order'}
          </p>
        </div>
        <button type="button" className="queue-close" onClick={onClose} aria-label="Close playlist">
          &times;
        </button>
      </div>

      <ol className="queue-list">
        {order.map((playlistIndex, slot) => {
          const track = playlist[playlistIndex]
          return (
            <li key={track.id}>
              <QueueTrackRow
                track={track}
                slot={slot}
                isCurrent={slot === pointer}
                isPlaying={playing}
                isBroken={brokenIds.has(track.id)}
                onSelect={() => onSelect(playlistIndex)}
              />
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
