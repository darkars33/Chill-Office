import QueueTrackRow from '@/components/queue/QueueTrackRow'

const drawer = [
  'fixed top-0 right-0 bottom-0 z-5 flex w-[min(420px,100vw)] flex-col',
  'border-l border-shell/16 bg-[#160f14]/90 backdrop-blur-[20px] backdrop-saturate-[1.1]',
  'shadow-[-24px_0_60px_rgba(8,3,6,0.5)]',
  'transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
].join(' ')

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
    <aside
      className={`${drawer} ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-label="Playlist"
      aria-hidden={!open}
    >
      <div className="flex items-center gap-3 border-b border-shell/12 px-[18px] pt-5 pb-3.5">
        <div>
          <h2 className="text-[15px] [font-weight:750] tracking-[-0.01em]">The Chill Queue</h2>
          <p className="mt-[3px] text-[11px] text-linen/60">
            {playlist.length} classics, 1970&ndash;1999 · {shuffle ? 'shuffled' : 'in order'}
          </p>
        </div>
        <button
          type="button"
          className="ml-auto grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-linen/10 text-[17px] leading-none text-cream transition-colors duration-[160ms] hover:bg-linen/20"
          onClick={onClose}
          aria-label="Close playlist"
        >
          &times;
        </button>
      </div>

      <ol className="flex-1 list-none overflow-y-auto overscroll-contain px-2 pt-2 pb-6">
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
