// Every icon in the app. The shared stroke treatment lives here; size comes
// from the parent (`[&_svg]:size-*` on the control), and filled shapes opt out
// per-path. Strokes are light — this interface is held together by light rather
// than by line weight.
const base = {
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
  className:
    'overflow-visible fill-none stroke-current [stroke-width:1.6] [stroke-linecap:round] [stroke-linejoin:round]',
}

export function PlayIcon() {
  return (
    <svg {...base}>
      <path d="M8 5.4l11 6.6-11 6.6V5.4z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg {...base}>
      <rect x="7.2" y="5.2" width="3.4" height="13.6" rx="1.7" fill="currentColor" stroke="none" />
      <rect x="13.4" y="5.2" width="3.4" height="13.6" rx="1.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PreviousIcon() {
  return (
    <svg {...base}>
      <path d="M18 6.4v11.2L9.4 12 18 6.4z" fill="currentColor" stroke="none" />
      <path d="M6 5.6v12.8" />
    </svg>
  )
}

export function NextIcon() {
  return (
    <svg {...base}>
      <path d="M6 6.4v11.2L14.6 12 6 6.4z" fill="currentColor" stroke="none" />
      <path d="M18 5.6v12.8" />
    </svg>
  )
}

export function ShuffleIcon() {
  return (
    <svg {...base}>
      <path d="M17 4l3 3-3 3" />
      <path d="M20 7h-4c-2 0-3 1-4.4 3.2L9.6 13.4C8.4 15.3 7.3 17 5 17H3" />
      <path d="M17 14l3 3-3 3" />
      <path d="M3 7h2c1.6 0 2.6.9 3.6 2.2" />
      <path d="M13.2 15c1.2 1.5 2.2 2 3.8 2h3" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg {...base}>
      <path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.2" />
      <path d="M15.7 15.7L20 20" />
    </svg>
  )
}

export function SendIcon() {
  return (
    <svg {...base}>
      <path d="M4.4 12h14M12.6 6l6 6-6 6" />
    </svg>
  )
}

/** Discover: a wayfinding mark rather than a magnifying glass. */
export function CompassIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4 4.4-2z" />
    </svg>
  )
}

/** Presence: concentric signal arcs. Used wherever a live count appears. */
export function SignalIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M8.2 8.2a5.4 5.4 0 000 7.6M15.8 15.8a5.4 5.4 0 000-7.6" />
      <path d="M5.4 5.4a9.4 9.4 0 000 13.2M18.6 18.6a9.4 9.4 0 000-13.2" opacity="0.5" />
    </svg>
  )
}

/** A whisper: one open bubble, deliberately unclosed. */
export function WhisperIcon() {
  return (
    <svg {...base}>
      <path d="M20 12.4c0 3.4-3.4 6.2-7.6 6.2-.9 0-1.8-.1-2.6-.4L5 20l1.3-3.2A5.8 5.8 0 014.8 12.4C4.8 9 8.2 6.2 12.4 6.2S20 9 20 12.4z" />
    </svg>
  )
}

export function SpeakerIcon({ muted = false }) {
  return (
    <svg {...base}>
      <path d="M5 9.2v5.6h3l4.4 3.8V5.4L8 9.2H5z" fill="currentColor" />
      {muted ? (
        <path d="M16.8 9.6l4.4 4.8M21.2 9.6l-4.4 4.8" />
      ) : (
        <path d="M16.4 8.9a4.4 4.4 0 010 6.2M18.9 6.6a8 8 0 010 10.8" />
      )}
    </svg>
  )
}

/** Wander: a die, because the action is deliberately not a choice. */
export function WanderIcon() {
  return (
    <svg {...base}>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Queue: a stack of what is coming. */
export function QueueIcon() {
  return (
    <svg {...base}>
      <path d="M4 7h11M4 12h11M4 17h7" />
      <path d="M19 9.4v8.2" />
      <circle cx="17" cy="17.6" r="2" />
    </svg>
  )
}

export function ArrowOutIcon() {
  return (
    <svg {...base}>
      <path d="M9 15l6-6M10.2 8.6H15.4V13.8" />
    </svg>
  )
}

export function KeyboardIcon() {
  return (
    <svg {...base}>
      <rect x="2.6" y="6.6" width="18.8" height="10.8" rx="2.6" />
      <path d="M6.6 10.2h.01M9.8 10.2h.01M13 10.2h.01M16.2 10.2h.01M8.4 13.8h7.2" />
    </svg>
  )
}

/** Nav: your own desk. */
export function DeskIcon() {
  return (
    <svg {...base}>
      <path d="M3.2 9.4h17.6" />
      <path d="M4.6 9.4V19M19.4 9.4V19" />
      <path d="M5.2 5.4h13.6a1.6 1.6 0 011.6 1.6v2.4H3.6V7a1.6 1.6 0 011.6-1.6z" />
      <path d="M9 13.4h6" />
    </svg>
  )
}

/** Nav: the other rooms on this floor. */
export function RoomsIcon() {
  return (
    <svg {...base}>
      <rect x="3.4" y="4.4" width="7.4" height="7.4" rx="1.6" />
      <rect x="13.2" y="4.4" width="7.4" height="7.4" rx="1.6" />
      <rect x="3.4" y="13.6" width="7.4" height="6" rx="1.6" />
      <rect x="13.2" y="13.6" width="7.4" height="6" rx="1.6" />
    </svg>
  )
}

/** Nav: what has been happening. */
export function ActivityIcon() {
  return (
    <svg {...base}>
      <path d="M3 12.4h3.6l2.2-5.6 3.4 10.4 2.4-6.2 1.6 3.4H21" />
    </svg>
  )
}

/** The lounge: somewhere to sit. */
export function LoungeIcon() {
  return (
    <svg {...base}>
      <path d="M4.4 11.4V8.8a2 2 0 012-2h11.2a2 2 0 012 2v2.6" />
      <path d="M3 13.2a1.8 1.8 0 013.6 0v2.4h10.8v-2.4a1.8 1.8 0 013.6 0V18H3v-4.8z" />
    </svg>
  )
}
