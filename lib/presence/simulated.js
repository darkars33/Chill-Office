import { identityFor } from '@/lib/identity'
import { hash, pick, range, rng } from '@/lib/seed'

/**
 * ⚠  LOCAL SIMULATION — NOT REAL PEOPLE.
 *
 * Every person, message, reaction and movement produced here is generated
 * inside this one browser tab. Nobody else can see them and they cannot see
 * anybody. This module exists so the product can be built and judged before a
 * realtime backend exists.
 *
 * `IS_SIMULATED` is exported so the interface can say so out loud. Do not set
 * it to false while this file is still the implementation — showing invented
 * people to a real user as though they were in the room would be a lie told by
 * the product, not a placeholder.
 *
 * Replace this module, do not un-flag it. See `lib/presence/index.js`.
 */
export const IS_SIMULATED = true

// Deliberately content-free: reactions to a moment in a room, never claims
// about anything or anyone.
const LINES = [
  'this song is perfect for working',
  'literally 🔥',
  'been on loop all afternoon',
  'ok whoever queued this, thank you',
  'the bassline. genuinely.',
  'first time hearing this',
  'this room has taste',
  'turning this up',
  'exactly what i needed today',
  'the bridge on this one',
  'straight to the list',
  'no notes',
  'i keep ending up back in here',
  'good call',
  'still working, still listening',
  'this is a whole mood',
  'anyone else just here for the outro',
  'quietest room on the floor and the best music',
]

const WHISPER_OPENERS = [
  'hey',
  'good taste',
  'you been in here long?',
  'what else are you listening to?',
  'hi stranger',
  'this room is better than the lounge',
]

const REPLIES = [
  'ha, same',
  'yeah',
  'about twenty minutes',
  'mostly stuff like this honestly',
  'no idea, it just found me',
  'nice one',
  'what brought you in?',
  'should be working but',
]

let uid = 0
const nextId = () => `${Date.now().toString(36)}-${(uid += 1)}`

/**
 * Where somebody is standing.
 *
 * `x` runs across the floor and `depth` runs away from the viewer, 0 at the
 * back wall and 1 at the front edge. Two rules, and both of them are really
 * about legibility rather than about physics:
 *
 *  · The middle is kept clear, because the station is there. People gather
 *    around it, not on it.
 *
 *  · Nobody stands within touching distance of anybody else. Every figure
 *    carries a name plate, and two plates on top of each other is the fastest
 *    way to turn a room full of people back into visual noise. The gap is
 *    wider across than it is deep, because that is the axis the plates run on.
 *
 * @param {Array<{spot: {x: number, depth: number}}>} taken who is already out there
 */
function findSpot(next, taken = []) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const x = next() * 0.9 + 0.05
    // Biased slightly toward the back, which is smaller on screen and can hold
    // more people before it reads as crowded.
    const depth = +(next() ** 1.25 * 0.9 + 0.06).toFixed(3)

    const fromStation = ((x - 0.5) / 0.3) ** 2 + ((depth - 0.46) / 0.34) ** 2
    if (fromStation <= 1) continue

    const clear = taken.every((other) => {
      const dx = (x - other.spot.x) / 0.115
      const dz = (depth - other.spot.depth) / 0.16
      return dx * dx + dz * dz > 1
    })
    if (clear) return { x: +x.toFixed(3), depth }
  }
  // The room is full. Put them at the edge rather than loop forever.
  return { x: next() < 0.5 ? 0.05 : 0.95, depth: +(next() * 0.8 + 0.1).toFixed(3) }
}

/**
 * @param {boolean} [alreadyHere] true for the people who were in the room
 *   before you opened the door — without this the whole floor reads as having
 *   "just joined" for the first fifteen seconds of every visit, which is both
 *   wrong and the first thing anybody notices.
 */
function makePerson(roomId, slot, next, alreadyHere = false, taken = []) {
  const person = identityFor(`${roomId}:${slot}:${range(next, 0, 9999)}`)
  return {
    ...person,
    joinedAt: Date.now() - (alreadyHere ? range(next, 20, 2400) * 1000 : 0),
    spot: findSpot(next, taken),
    /** Seeded so a crowd never sways in unison. */
    idle: { duration: +(4.5 + next() * 4).toFixed(2), delay: +(-next() * 6).toFixed(2) },
    /** Sitting people read as working; standing people read as passing through. */
    seated: next() < 0.55,
    away: false,
    lastSpokeAt: 0,
  }
}

/**
 * @param {object} options
 * @param {{id: string, listeners: number, heat: number}} options.room
 * @param {{id: string, handle: string, hue: number, seed: number}} options.self
 * @param {number} [options.cap] how many people to actually materialise
 */
export function createPresenceClient({ room, self, cap = 22 }) {
  const next = rng(hash(room.id) ^ 0x1234)
  const subscribers = new Set()
  const timers = []
  let destroyed = false

  let total = room.listeners
  const visible = Math.min(cap, total)

  let state = {
    total,
    /** The people actually standing on the floor. */
    // Built one at a time so each new arrival can see where the last one
    // stood and keep out of their way.
    people: Array.from({ length: visible }).reduce(
      (crowd, _, i) => [...crowd, makePerson(room.id, i, next, true, crowd)],
      [],
    ),
    messages: [],
    reactions: [],
    /** Ambient office noise: who arrived, who left, who reacted. */
    activity: [],
    whispers: {},
  }

  const emit = () => {
    if (destroyed) return
    state = { ...state }
    for (const fn of subscribers) fn(state)
  }

  const every = (min, max, fn) => {
    const tick = () => {
      if (destroyed) return
      fn()
      timers.push(setTimeout(tick, range(next, min, max)))
    }
    timers.push(setTimeout(tick, range(next, min, max)))
  }

  const note = (kind, person, detail) => {
    state.activity = [
      ...state.activity,
      {
        id: nextId(),
        kind,
        handle: person.handle,
        hue: person.hue,
        tint: person.tint,
        seed: person.seed,
        detail,
        at: Date.now(),
      },
    ].slice(-24)
  }

  const pushMessage = (message) => {
    // Bounded, and never persisted anywhere. When the tab closes it is gone.
    state.messages = [...state.messages, message].slice(-40)
    emit()
  }

  // ── arriving and leaving ─────────────────────────────────────────────────
  if (total > 0) {
    every(3400, 9000, () => {
      const leaving = state.people.length > 3 && next() < 0.45
      if (leaving) {
        const at = range(next, 0, state.people.length - 1)
        const gone = state.people[at]
        state.people = state.people.filter((_, i) => i !== at)
        total = Math.max(1, total - range(next, 1, 3))
        note('leave', gone)
      } else if (state.people.length < visible) {
        const arriving = makePerson(room.id, range(next, 0, 9999), next, false, state.people)
        state.people = [...state.people, arriving]
        total += range(next, 1, 3)
        note('join', arriving)
      } else {
        total += range(next, -2, 3)
      }
      state.total = Math.max(state.people.length, total)
      emit()
    })
  }

  // ── moving around the floor ──────────────────────────────────────────────
  // One person at a time crosses the room. Everybody drifting at once looks
  // like a screensaver rather than like an office.
  every(4200, 9500, () => {
    if (!state.people.length) return
    const at = range(next, 0, state.people.length - 1)
    const others = state.people.filter((_, i) => i !== at)
    state.people = state.people.map((p, i) =>
      i === at ? { ...p, spot: findSpot(next, others), seated: next() < 0.55 } : p,
    )
    emit()
  })

  // ── stepping away from the desk ──────────────────────────────────────────
  every(9000, 20000, () => {
    if (!state.people.length) return
    const at = range(next, 0, state.people.length - 1)
    state.people = state.people.map((p, i) => (i === at ? { ...p, away: !p.away } : p))
    emit()
  })

  // ── conversation ─────────────────────────────────────────────────────────
  // Cadence scales with how talkative the room is, so the Lounge feels like the
  // Lounge and the Quiet Room stays quiet.
  if (total > 2) {
    const fast = Math.round(11000 - room.heat * 6500)
    every(fast, fast + 9000, () => {
      if (!state.people.length) return
      const from = pick(next, state.people)
      state.people = state.people.map((p) =>
        p.id === from.id ? { ...p, lastSpokeAt: Date.now(), away: false } : p,
      )
      pushMessage({
        id: nextId(),
        authorId: from.id,
        handle: from.handle,
        hue: from.hue,
        tint: from.tint,
        seed: from.seed,
        text: pick(next, LINES),
        at: Date.now(),
        mine: false,
      })
    })
  }

  // ── somebody reacting to the song ────────────────────────────────────────
  if (total > 4) {
    every(12000, 26000, () => {
      if (!state.people.length) return
      const from = pick(next, state.people)
      const emoji = pick(next, ['🔥', '☕', '🎧', '👀', '🌙', '🫡'])
      const reaction = { id: nextId(), emoji, at: Date.now(), authorId: from.id }
      state.reactions = [...state.reactions, reaction].slice(-10)
      note('react', from, emoji)
      emit()
      timers.push(
        setTimeout(() => {
          if (destroyed) return
          state.reactions = state.reactions.filter((r) => r.id !== reaction.id)
          emit()
        }, 3200),
      )
    })
  }

  // ── the occasional unprompted whisper ────────────────────────────────────
  if (total > 8) {
    every(42000, 95000, () => {
      if (Object.keys(state.whispers).length > 2 || !state.people.length) return
      const from = pick(next, state.people)
      if (state.whispers[from.id]) return
      state.whispers = {
        ...state.whispers,
        [from.id]: {
          peer: from,
          openedAt: Date.now(),
          unread: true,
          messages: [
            {
              id: nextId(),
              authorId: from.id,
              text: pick(next, WHISPER_OPENERS),
              at: Date.now(),
              mine: false,
            },
          ],
        },
      }
      emit()
    })
  }

  return {
    subscribe(fn) {
      subscribers.add(fn)
      fn(state)
      return () => subscribers.delete(fn)
    },

    say(text) {
      const clean = text.trim().slice(0, 240)
      if (!clean) return
      pushMessage({
        id: nextId(),
        authorId: self.id,
        handle: self.handle,
        hue: self.hue,
        tint: self.tint,
        seed: self.seed,
        text: clean,
        at: Date.now(),
        mine: true,
      })
    },

    react(emoji) {
      const reaction = { id: nextId(), emoji, at: Date.now(), authorId: self.id }
      state.reactions = [...state.reactions, reaction].slice(-10)
      note('react', self, emoji)
      emit()
      // A reaction is a flash, not a record.
      timers.push(
        setTimeout(() => {
          if (destroyed) return
          state.reactions = state.reactions.filter((r) => r.id !== reaction.id)
          emit()
        }, 3200),
      )
    },

    openWhisper(peerId) {
      const peer = state.people.find((p) => p.id === peerId)
      if (!peer) return
      const existing = state.whispers[peerId]
      state.whispers = {
        ...state.whispers,
        [peerId]: existing
          ? { ...existing, unread: false }
          : { peer, openedAt: Date.now(), unread: false, messages: [] },
      }
      emit()
    },

    sendWhisper(peerId, text) {
      const thread = state.whispers[peerId]
      const clean = text.trim().slice(0, 240)
      if (!thread || !clean) return

      state.whispers = {
        ...state.whispers,
        [peerId]: {
          ...thread,
          messages: [
            ...thread.messages,
            { id: nextId(), authorId: self.id, text: clean, at: Date.now(), mine: true },
          ],
        },
      }
      emit()

      timers.push(
        setTimeout(
          () => {
            if (destroyed) return
            const current = state.whispers[peerId]
            if (!current) return
            state.whispers = {
              ...state.whispers,
              [peerId]: {
                ...current,
                messages: [
                  ...current.messages,
                  {
                    id: nextId(),
                    authorId: peerId,
                    text: pick(next, REPLIES),
                    at: Date.now(),
                    mine: false,
                  },
                ],
              },
            }
            emit()
          },
          range(next, 1600, 4600),
        ),
      )
    },

    closeWhisper(peerId) {
      // Closing is deletion. There is no archive to go back to.
      const { [peerId]: gone, ...rest } = state.whispers
      void gone
      state.whispers = rest
      emit()
    },

    destroy() {
      destroyed = true
      for (const t of timers) clearTimeout(t)
      timers.length = 0
      subscribers.clear()
    },
  }
}
