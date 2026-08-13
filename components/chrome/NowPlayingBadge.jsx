/** Centre badge: which film the current song is from, with a live/paused dot. */
export default function NowPlayingBadge({ track, playing }) {
  return (
    <p className={playing ? 'now-badge is-playing' : 'now-badge'}>
      <span className="now-dot" aria-hidden="true" />
      <span>
        {track.film} · {track.year}
      </span>
    </p>
  )
}
