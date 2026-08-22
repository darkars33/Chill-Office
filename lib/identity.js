import { moodHue, tintOffset } from '@/lib/palette'
import { hash, pick, range, rng } from '@/lib/seed'

/**
 * Anonymous identity.
 *
 * An identity here is not an account. It is a *costume*: a handle, a colour and
 * a figure, all derived from one throwaway id that lives for as long as the tab
 * does. Nothing about it is stored, nothing about it is linked to a person, and
 * the same person who comes back tomorrow will be somebody else.
 *
 * Everything is derived rather than stored so that a handle can be reconstructed
 * from an id alone — which is all a presence transport ever needs to send.
 */

// Deliberately atmospheric rather than cute: the handle should read as somebody
// passing through at 2am, not as a username someone chose and grew attached to.
const PREFIX = [
  'ghost', 'void', 'blue', 'night', 'static', 'ember', 'moth', 'lunar',
  'echo', 'glass', 'neon', 'slow', 'quiet', 'amber', 'velvet', 'rain',
  'salt', 'iron', 'dusk', 'silver', 'hazel', 'cobalt', 'ash', 'pale',
  'wired', 'lonely', 'faded', 'soft', 'wolf', 'paper', 'copper', 'drift',
]

const SUFFIX = [
  'fox', 'owl', 'moth', 'wire', 'signal', 'radio', 'room', 'tape',
  'static', 'hour', 'light', 'noise', 'wave', 'dream', 'ghost', 'bird',
  'star', 'smoke', 'river', 'glass', 'echo', 'lark', 'deer', 'moon',
]

/**
 * Two shapes, mixed so a room's roster does not read as one template:
 * `bluefox` / `nightowl`, and `ghost_42` / `void_17`.
 */
function handleFor(next) {
  const stem = pick(next, PREFIX)
  return next() < 0.5
    ? `${stem}${pick(next, SUFFIX)}`
    : `${stem}_${range(next, 10, 99)}`
}

/**
 * Everything renderable about one anonymous person.
 *
 * @param {string} id an opaque, throwaway session id
 * @returns {{id: string, handle: string, hue: number, tint: number, seed: number}}
 */
export function identityFor(id) {
  const seed = hash(id)
  const next = rng(seed)
  return {
    id,
    handle: handleFor(next),
    /** Their own colour, used wherever they are named. */
    hue: moodHue(seed),
    /** How far their node sits from the room's colour. See `lib/palette`. */
    tint: tintOffset(seed),
    seed,
  }
}

/** A fresh id for this tab. Never persisted — a reload is a new person. */
export function newSessionId() {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
