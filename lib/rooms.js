import { AREAS, areaById, areaFor } from '@/lib/areas'
import { moodHue } from '@/lib/palette'
import { PLAYLIST } from '@/lib/playlist'
import { hash, range, rng } from '@/lib/seed'

/**
 * Rooms.
 *
 * A song *is* a room, and every room stands in one of the office's five areas
 * (see `lib/areas`). That is the whole navigation model: you are somewhere, and
 * the other places are down the hall.
 *
 * Every field below is a pure function of the track id, so two people opening
 * the directory at the same moment see the same floor plan in the same colours,
 * and the server and the client agree without a round trip.
 */

const GOLDEN_ANGLE = 137.50776405003785

/**
 * A room's baseline population. Skewed hard so the office has a couple of
 * packed floors and a long tail of empty side rooms — a flat distribution reads
 * as fake immediately, and it would also leave every area the same size.
 */
function baselineListeners(seed) {
  const next = rng(seed ^ 0x9e37)
  const roll = next()
  if (roll > 0.93) return range(next, 620, 1180)
  if (roll > 0.72) return range(next, 180, 480)
  if (roll > 0.34) return range(next, 44, 170)
  return range(next, 0, 34)
}

/**
 * @typedef {object} Room
 * @property {string} id        the track id, which is also the room id
 * @property {object} track
 * @property {import('@/lib/areas').AreaId} areaId
 * @property {number} hue       drives the accents while you are inside
 * @property {number} listeners baseline population
 * @property {number} heat      0–1, how much conversation is happening
 * @property {{x: number, y: number}} plan position on the directory floor plan
 */

/** @type {Room[]} */
export const ROOMS = PLAYLIST.map((track, i) => {
  const seed = hash(track.id)
  const next = rng(seed)
  const listeners = baselineListeners(seed)
  // Conversation does not track population — some packed rooms are silent and
  // some near-empty ones are all talk, which is the interesting part.
  const heat = +(next() * 0.75 + (listeners > 300 ? 0.25 : 0.05)).toFixed(3)
  const areaId = areaFor(track, listeners, heat)

  // A phyllotaxis spiral: even coverage with no visible grid, and stable
  // because it is a pure function of the index.
  const angle = (i * GOLDEN_ANGLE * Math.PI) / 180
  const radius = Math.sqrt((i + 0.6) / PLAYLIST.length) * 0.46

  return {
    id: track.id,
    track,
    areaId,
    // Rooms sit near their area's colour rather than picking their own, so a
    // space reads as one place. The wander is small and deterministic.
    hue: Math.round((areaById(areaId).hue + (moodHue(seed) % 17) - 8 + 360) % 360),
    listeners,
    heat,
    plan: {
      x: +(0.5 + radius * Math.cos(angle)).toFixed(4),
      y: +(0.5 + radius * Math.sin(angle) * 0.82).toFixed(4),
    },
  }
})

const BY_ID = new Map(ROOMS.map((room) => [room.id, room]))

export function roomById(id) {
  return BY_ID.get(id)
}

/** Rooms grouped by the space they stand in, in floor-plan order. */
export const ROOMS_BY_AREA = AREAS.map((area) => ({
  area,
  rooms: ROOMS.filter((room) => room.areaId === area.id).sort(
    (a, b) => b.listeners - a.listeners,
  ),
}))

export const ROOMS_BY_HEAT = [...ROOMS].sort((a, b) => b.listeners - a.listeners)
export const ROOMS_BY_TALK = [...ROOMS].sort((a, b) => b.heat - a.heat)

export const TOTAL_LISTENERS = ROOMS.reduce((sum, r) => sum + r.listeners, 0)

/** Other rooms in the same space — the "down the hall" list in the rail. */
export function neighboursOf(roomId, limit = 5) {
  const room = roomById(roomId)
  if (!room) return []
  return ROOMS.filter((r) => r.areaId === room.areaId && r.id !== roomId)
    .sort((a, b) => b.listeners - a.listeners)
    .slice(0, limit)
}

/** `1,182` — counts appear everywhere and always read the same way. */
export function formatCount(n) {
  return n.toLocaleString('en-US')
}
