import { NextIcon, PreviousIcon, ShuffleIcon } from '@/components/ui/Icons'

/** Shuffle, previous, play/pause, next. */
export default function TransportControls({
  playing,
  ready,
  buffering,
  shuffle,
  onToggle,
  onNext,
  onPrevious,
  onToggleShuffle,
}) {
  // Show the spinner while the embed boots, and while it rebuffers from a stop.
  const loading = !ready || (buffering && !playing)

  return (
    <div className="controls">
      <button
        type="button"
        className={shuffle ? 'icon-btn is-on' : 'icon-btn'}
        onClick={onToggleShuffle}
        aria-pressed={shuffle}
        aria-label="Shuffle"
        title="Shuffle (S)"
      >
        <ShuffleIcon />
      </button>

      <button
        type="button"
        className="icon-btn"
        onClick={onPrevious}
        aria-label="Previous track"
        title="Previous (Shift + ←)"
      >
        <PreviousIcon />
      </button>

      <button
        type="button"
        className="play-btn"
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause' : 'Play'}
        title="Play / pause (Space)"
      >
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <>
            <span className="play-icon" aria-hidden="true" />
            <span className="pause-icon" aria-hidden="true" />
          </>
        )}
      </button>

      <button
        type="button"
        className="icon-btn"
        onClick={onNext}
        aria-label="Next track"
        title="Next (Shift + →)"
      >
        <NextIcon />
      </button>
    </div>
  )
}
