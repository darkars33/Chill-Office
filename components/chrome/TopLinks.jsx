import { QueueIcon, SpeakerIcon, YouTubeIcon } from '@/components/ui/Icons'
import { watchUrl } from '@/lib/utils/youtube'

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
    <nav className="top-links" aria-label="Links and options">
      <button type="button" onClick={onOpenQueue} aria-expanded={queueOpen}>
        <QueueIcon />
        <span>Queue · {queueCount}</span>
      </button>

      <button type="button" onClick={onToggleMute} aria-pressed={muted}>
        <SpeakerIcon muted={muted} />
        <span>{muted ? 'Muted' : 'Sound'}</span>
      </button>

      <a
        href={watchUrl(track.id)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open “${track.title}” on YouTube`}
      >
        <YouTubeIcon />
        <span>YouTube</span>
      </a>
    </nav>
  )
}
