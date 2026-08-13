import AlbumSleeve from '@/components/player/AlbumSleeve'
import TrackPanel from '@/components/player/TrackPanel'
import TransportControls from '@/components/player/TransportControls'

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
    <section className="player" aria-label="Music player">
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
