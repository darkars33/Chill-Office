// Every icon in the app. Stroke width, size and linecaps come from CSS
// (`.top-links svg`, `.icon-btn svg`); the filled shapes opt out per-path.
const base = { viewBox: '0 0 24 24', 'aria-hidden': 'true' }

export function QueueIcon() {
  return (
    <svg {...base}>
      <path d="M4 7h11M4 12h11M4 17h7" />
      <path d="M19 10v8" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

export function SpeakerIcon({ muted = false }) {
  return (
    <svg {...base}>
      <path d="M5 9v6h3l4.5 4V5L8 9H5z" fill="currentColor" />
      {muted ? (
        <path d="M17 9.5l4 5M21 9.5l-4 5" />
      ) : (
        <path d="M16.5 8.8a4.5 4.5 0 010 6.4M19 6.5a8 8 0 010 11" />
      )}
    </svg>
  )
}

export function YouTubeIcon() {
  return (
    <svg {...base}>
      <path
        d="M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 002.4 7.2C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 001.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 001.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M10.2 9.3l4.6 2.7-4.6 2.7V9.3z" fill="#2a1a20" stroke="none" />
    </svg>
  )
}

export function ShuffleIcon() {
  return (
    <svg {...base}>
      <path d="M17 4l3 3-3 3" />
      <path d="M20 7H16c-2 0-3 1-4.4 3.2L9.6 13.4C8.4 15.3 7.3 17 5 17H3" />
      <path d="M17 14l3 3-3 3" />
      <path d="M3 7h2c1.6 0 2.6.9 3.6 2.2" />
      <path d="M13.2 15c1.2 1.5 2.2 2 3.8 2h3" />
    </svg>
  )
}

export function PreviousIcon() {
  return (
    <svg {...base}>
      <path d="M18 6v12L9 12l9-6z" fill="currentColor" stroke="none" />
      <path d="M6 5v14" />
    </svg>
  )
}

export function NextIcon() {
  return (
    <svg {...base}>
      <path d="M6 6v12l9-6-9-6z" fill="currentColor" stroke="none" />
      <path d="M18 5v14" />
    </svg>
  )
}
