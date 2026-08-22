/**
 * The floor plan.
 *
 * The office has five spaces, and every song sits in exactly one of them. This
 * is what turns fifty tracks into somewhere with geography: you are not
 * scrolling a list, you are in the Quiet Room and there is a Lounge down the
 * hall with more people in it.
 *
 * Which space a song belongs to is derived from the song itself — how long it
 * runs, what decade it is from, how busy it is — so the plan is fixed. The
 * Lounge is always the Lounge, and you can learn your way around.
 */

/** @typedef {'listening'|'lounge'|'quiet'|'late'|'trending'} AreaId */

export const AREAS = [
  {
    id: 'listening',
    name: 'Listening Room',
    plate: 'Listening',
    hue: 32,
    blurb: 'The main floor. Headphones on, nobody talking much.',
  },
  {
    id: 'lounge',
    name: 'The Lounge',
    plate: 'Lounge',
    hue: 20,
    blurb: 'Sofas, chatter, somebody always has an opinion.',
  },
  {
    id: 'quiet',
    name: 'Quiet Room',
    plate: 'Quiet',
    hue: 128,
    blurb: 'Small rooms with the door shut. Two or three people, tops.',
  },
  {
    id: 'late',
    name: 'Late Night',
    plate: 'Late',
    hue: 248,
    blurb: 'The long ones. Lights down, nobody leaving.',
  },
  {
    id: 'trending',
    name: 'Trending Floor',
    plate: 'Trending',
    hue: 62,
    blurb: 'Wherever the crowd went. Loud, full, hard to hear yourself.',
  },
]

const BY_ID = new Map(AREAS.map((area) => [area.id, area]))

export function areaById(id) {
  return BY_ID.get(id) ?? AREAS[0]
}

/**
 * Put a song somewhere. Order is precedence, not preference — a packed room is
 * on the Trending Floor no matter how long the track is.
 *
 * @param {{seconds: number, year: number}} track
 * @param {number} listeners
 * @param {number} heat 0–1
 * @returns {AreaId}
 */
export function areaFor(track, listeners, heat) {
  if (listeners >= 420) return 'trending'
  if (listeners <= 40) return 'quiet'
  if (track.seconds >= 300) return 'late'
  if (heat >= 0.62) return 'lounge'
  return 'listening'
}
