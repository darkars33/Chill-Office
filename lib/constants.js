// Tunables shared across hooks and components. Anything a reader might want to
// nudge lives here rather than buried in a callback.

/** YouTube's IFrame API script. Global singleton, injected once per page. */
export const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

/**
 * The embed must stay laid out at a real size for YouTube to keep streaming,
 * so it is parked off-screen (see `.yt-host`) rather than hidden.
 */
export const EMBED_SIZE = { width: 356, height: 200 }

/** 100 = gone, 101/150 = owner disallows embedding. Nothing to retry, skip on. */
export const FATAL_PLAYER_ERRORS = new Set([100, 101, 150])

/** One retry for transient decode/network hiccups, then give up on the track. */
export const MAX_PLAYER_RETRIES = 1

/** How often the progress bar re-reads the player clock while playing. */
export const PROGRESS_TICK_MS = 250

/** How long a toast stays on screen. */
export const TOAST_DURATION_MS = 2600

/** Desk clock tick. */
export const CLOCK_TICK_MS = 1000

/** Seconds an arrow key seeks. */
export const SEEK_STEP_SECONDS = 5
