import { NextIcon, PreviousIcon, ShuffleIcon } from '@/components/ui/Icons'

const iconButton = [
  'relative grid h-[34px] w-9 flex-none place-items-center rounded-lg border-0 p-0 pill:w-[30px]',
  'cursor-pointer bg-transparent text-cream/80',
  'transition-[color,transform] duration-[160ms]',
  'hover:text-white focus-visible:text-white active:scale-86',
  'aria-pressed:text-amber',
  '[&>svg]:size-[19px]',
].join(' ')

/** The dot under the shuffle button while it is on. */
const onDot =
  "after:absolute after:bottom-[3px] after:size-1 after:rounded-full after:bg-current after:content-['']"

const playButton = [
  'grid size-11 flex-none place-items-center rounded-full border-0 p-0',
  'cursor-pointer bg-[#fffaf2] text-[#1e1219] shadow-[0_7px_18px_rgba(24,8,3,0.28)]',
  'transition-[transform,background-color] duration-[160ms]',
  'hover:scale-105 hover:bg-white focus-visible:scale-105 focus-visible:bg-white active:scale-94',
].join(' ')

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
    <div
      className={[
        'flex items-center justify-center',
        // Drops to its own full-width row on the narrowest layout.
        'col-span-2 gap-[clamp(10px,4vw,22px)] pill:col-auto pill:gap-1 wide:gap-2',
      ].join(' ')}
    >
      <button
        type="button"
        className={shuffle ? `${iconButton} ${onDot}` : iconButton}
        onClick={onToggleShuffle}
        aria-pressed={shuffle}
        aria-label="Shuffle"
        title="Shuffle (S)"
      >
        <ShuffleIcon />
      </button>

      <button
        type="button"
        className={iconButton}
        onClick={onPrevious}
        aria-label="Previous track"
        title="Previous (Shift + ←)"
      >
        <PreviousIcon />
      </button>

      <button
        type="button"
        className={playButton}
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause' : 'Play'}
        title="Play / pause (Space)"
      >
        {loading ? (
          <span
            className="size-[15px] animate-loader-spin rounded-full border-2 border-[#1e1219]/25 border-t-[#1e1219]"
            aria-hidden="true"
          />
        ) : playing ? (
          <span className="h-[15px] w-3 border-x-4 border-x-current" aria-hidden="true" />
        ) : (
          <span
            className="ml-[3px] size-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current"
            aria-hidden="true"
          />
        )}
      </button>

      <button
        type="button"
        className={iconButton}
        onClick={onNext}
        aria-label="Next track"
        title="Next (Shift + →)"
      >
        <NextIcon />
      </button>
    </div>
  )
}
