/**
 * Deterministic randomness.
 *
 * Almost everything generated in this app — a listener's handle, their colour,
 * which figure they are drawn as, where a room sits on the floor plan — is derived
 * from a seed rather than from `Math.random()`. Two reasons:
 *
 *  1. Everyone in a room has to see the same thing. A handle that rendered
 *     differently for each viewer would not be an identity.
 *  2. It survives a reload and a server render without hydrating mismatched.
 */

/** FNV-1a. Small, fast, and good enough to spread short ids across the space. */
export function hash(input) {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Mulberry32: a seeded PRNG returning a fresh `() => [0,1)` each time. */
export function rng(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick from a list with a `next()` from `rng`. */
export function pick(next, list) {
  return list[Math.floor(next() * list.length) % list.length]
}

/** Integer in [min, max]. */
export function range(next, min, max) {
  return min + Math.floor(next() * (max - min + 1))
}
