/** Centre badge: which film the current song is from, with a live/paused dot. */
export default function NowPlayingBadge({ track, playing }) {
  return (
    <p
      className={[
        // Hidden below `pill`, where it would collide with the clock and the links.
        'fixed left-1/2 z-2 hidden -translate-x-1/2 items-center gap-2 pill:inline-flex',
        // The 13px is the <p> margin the browser used to supply and Tailwind's
        // preflight now resets; kept so the badge stays where it has always sat.
        'top-[clamp(16px,3vw,27px)] mt-[13px] max-w-[min(46vw,420px)]',
        'text-[13px] leading-none font-bold text-cream/94 text-shadow-chrome',
      ].join(' ')}
    >
      <span
        className={[
          'size-[9px] flex-none rounded-full',
          playing
            ? 'animate-dot-pulse bg-live shadow-[0_0_12px_rgba(23,224,127,0.8)] motion-reduce:animate-none'
            : 'bg-ember shadow-[0_0_12px_rgba(255,176,85,0.85)]',
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="truncate">
        {track.film} · {track.year}
      </span>
    </p>
  )
}
