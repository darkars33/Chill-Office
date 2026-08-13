/**
 * Range input styled as a progress bar. Dragging reports through `onScrub` and
 * only commits on release, so the ticking player clock can't fight the thumb.
 */
export default function SeekBar({ value, max, isScrubbing, onScrub, onCommit }) {
  const progress = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="scrub" style={{ '--progress': `${progress}%` }}>
      <input
        type="range"
        min="0"
        max={Math.max(1, Math.floor(max))}
        step="1"
        value={Math.floor(value)}
        aria-label="Seek"
        onChange={(e) => onScrub(Number(e.target.value))}
        onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
        onKeyUp={(e) => {
          if (isScrubbing) onCommit(Number(e.currentTarget.value))
        }}
      />
    </div>
  )
}
