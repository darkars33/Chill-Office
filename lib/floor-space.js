/**
 * The room's coordinate system.
 *
 * One shared idea, used by everything that stands on the floor: a `depth` of 0
 * is against the back wall and 1 is the near edge. That single number decides
 * where something sits vertically, how big it is, how hazy it is, and what it
 * paints in front of — which is the whole reason a flat div reads as a room.
 *
 * People and furniture both go through here, so a plant at depth 0.3 is
 * reliably behind somebody standing at 0.6, and neither has to know about the
 * other.
 */

/** The walkable band, as fractions of the stage height. */
export const BACK = 0.2
export const FRONT = 0.95

/** How much bigger something gets as it comes toward you. */
export const SCALE_BACK = 0.5
export const SCALE_FRONT = 1.15

/** Air between here and the back wall. */
export const HAZE_BACK = 0.5
export const HAZE_FRONT = 1

export const lerp = (a, b, t) => a + (b - a) * t

/**
 * How big everything in the room should be, given how much room there is.
 *
 * People, furniture and the station are all authored at one size and then
 * multiplied by this. Without it the figures are drawn at desktop scale inside
 * a phone-sized stage and the room turns into a close-up of three shoulders.
 *
 * @param {number} height the stage's height in px
 * @returns {number} 0.4–1
 */
export function fitFor(height) {
  return Math.max(0.4, Math.min(1, height / 620))
}

/** Everything a thing at this depth needs to know about itself. */
export function place(depth) {
  return {
    top: lerp(BACK, FRONT, depth),
    scale: lerp(SCALE_BACK, SCALE_FRONT, depth),
    opacity: lerp(HAZE_BACK, HAZE_FRONT, depth),
    z: 10 + Math.round(depth * 60),
  }
}
