import AlbumSleeve from '@/components/player/AlbumSleeve'
import TrackPanel from '@/components/player/TrackPanel'
import TransportControls from '@/components/player/TransportControls'

// The pill reflows twice. Narrowest: two columns with the transport dropped onto
// its own row. `pill` puts the transport back in line; `wide` is full size.
const pill = [
  'fixed left-1/2 z-3 grid -translate-x-1/2 items-center',
  'bottom-[calc(12px+env(safe-area-inset-bottom))] pill:bottom-[clamp(18px,6vh,54px)]',
  'grid-cols-[58px_minmax(0,1fr)] pill:grid-cols-[58px_minmax(0,1fr)_160px] wide:grid-cols-[72px_minmax(0,1fr)_176px]',
  'gap-x-3 gap-y-2 pill:gap-2.5 wide:gap-3.5',
  'w-[calc(100vw-20px)] wide:w-[min(600px,100vw-32px)]',
  'min-h-0 pill:min-h-[82px] wide:min-h-24',
  'pt-2.5 pr-3.5 pb-[9px] pl-2.5',
  'pill:pt-[9px] pill:pr-[13px] pill:pb-[9px] pill:pl-[9px]',
  'wide:pt-[11px] wide:pr-4 wide:pb-[11px] wide:pl-[11px]',
  'rounded-[26px] pill:rounded-full',
  'border border-shell/26 bg-[linear-gradient(110deg,rgba(50,42,56,0.94),rgba(122,61,42,0.92))]',
  'backdrop-blur-[16px] backdrop-saturate-[1.15]',
  'shadow-[0_22px_50px_rgba(12,5,2,0.42),inset_0_1px_rgba(255,255,255,0.14)]',
].join(' ')

/** The floating pill at the bottom of the screen: art, track, transport. */
export default function PlayerBar({
  track,
  position,
  shuffle,
  playing,
  ready,
  buffering,
  time,
  duration,
  onSeek,
  onToggle,
  onNext,
  onPrevious,
  onToggleShuffle,
}) {
  return (
    <section className={pill} aria-label="Music player">
      <AlbumSleeve track={track} playing={playing} />

      <TrackPanel
        track={track}
        time={time}
        duration={duration}
        position={position}
        onSeek={onSeek}
      />

      <TransportControls
        playing={playing}
        ready={ready}
        buffering={buffering}
        shuffle={shuffle}
        onToggle={onToggle}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleShuffle={onToggleShuffle}
      />
    </section>
  )
}
