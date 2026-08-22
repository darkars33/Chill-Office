// Tunables shared across hooks and components. Anything a reader might want to
// nudge lives here rather than buried in a callback.

/**
 * The product name, used in the wordmark, the metadata and the copy.
 *
 * The repo is still called `chill-office`; this is the only place the visible
 * name is set, so renaming the product is a one-line change.
 */
export const PRODUCT_NAME = 'Open Floor'

/** YouTube's IFrame API script. Global singleton, injected once per page. */
export const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

/**
 * The embed must stay laid out at a real size for YouTube to keep streaming,
 * so it is parked off-screen rather than hidden.
 */
export const EMBED_SIZE = { width: 356, height: 200 }

/** 100 = gone, 101/150 = owner disallows embedding. Nothing to retry, skip on. */
export const FATAL_PLAYER_ERRORS = new Set([100, 101, 150])

/** One retry for transient decode/network hiccups, then give up on the track. */
export const MAX_PLAYER_RETRIES = 1

/** How often the progress bar re-reads the player clock while playing. */
export const PROGRESS_TICK_MS = 250

/** Seconds an arrow key seeks. */
export const SEEK_STEP_SECONDS = 5

/** What you can throw at a room without typing. Office-appropriate, kept short. */
export const REACTIONS = ['🔥', '☕', '🎧', '👀', '🌙', '🫡']

/** Printed in the shortcut sheet and read out to screen readers. */
export const SHORTCUTS = [
  ['Space', 'Play or pause'],
  ['← →', 'Seek 5 seconds'],
  ['⇧ ← →', 'Previous / next room'],
  ['/', 'Say something to the room'],
  ['R', 'Walk somewhere else'],
  ['D', 'Open the directory'],
  ['Q', 'Queue'],
  ['Esc', 'Close whatever is open'],
]
