import { QueueIcon, SpeakerIcon, YouTubeIcon } from '@/components/ui/Icons'
import { watchUrl } from '@/lib/utils/youtube'

// The three controls are identical apart from their contents. Below `pill` they
// collapse to icon-only circles with their own backing, since at that width they
// sit over the brightest part of the window.
const control = [
  'inline-flex size-[34px] items-center justify-center gap-1.5 rounded-full border-0 p-0',
  'bg-[#28161e]/42 backdrop-blur-[8px]',
  'pill:size-auto pill:justify-start pill:rounded-none pill:bg-transparent pill:py-1 pill:backdrop-filter-none',
  'cursor-pointer text-[13px] leading-none font-bold text-cream/94 text-shadow-chrome',
  'transition-[opacity,transform] duration-[160ms]',
  'hover:-translate-y-px hover:opacity-78 focus-visible:-translate-y-px focus-visible:opacity-78',
  '[&>svg]:size-[18px]',
].join(' ')

/** The label beside each icon, which only appears once there is room for it. */
const label = 'hidden pill:inline'

/** Top-right controls: open the queue, mute, or open the track on YouTube. */
export default function TopLinks({
  track,
  queueCount,
  queueOpen,
  muted,
  onOpenQueue,
  onToggleMute,
}) {
  return (
    <nav
      className={[
        'fixed z-2 flex items-center',
        'top-[calc(9px+env(safe-area-inset-top))] right-[10px] gap-[5px]',
        'pill:top-[clamp(16px,3vw,27px)] pill:right-[clamp(18px,3vw,32px)] pill:gap-[clamp(10px,1.6vw,18px)]',
      ].join(' ')}
      aria-label="Links and options"
    >
      <button type="button" className={control} onClick={onOpenQueue} aria-expanded={queueOpen}>
        <QueueIcon />
        <span className={label}>Queue · {queueCount}</span>
      </button>

      <button type="button" className={control} onClick={onToggleMute} aria-pressed={muted}>
        <SpeakerIcon muted={muted} />
        <span className={label}>{muted ? 'Muted' : 'Sound'}</span>
      </button>

      <a
        href={watchUrl(track.id)}
        className={control}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open “${track.title}” on YouTube`}
      >
        <YouTubeIcon />
        <span className={label}>YouTube</span>
      </a>
    </nav>
  )
}
