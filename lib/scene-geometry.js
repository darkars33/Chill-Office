// Generated layout for the scattered parts of the office scene: dust motes and
// the lit windows in the towers across the road.
//
// The scene is server-rendered, so these values have to come out bit-identical
// in Node and in the browser or React reports a hydration mismatch. That rules
// out `Math.random()`, and it also rules out the usual `Math.sin(seed) * 43758`
// hash: ECMAScript does not require `Math.sin` to be exact, and Node's V8 and
// Chrome's disagree around the ninth significant digit — enough to make a mote's
// `cx` differ between the two renders.
//
// So this is mulberry32's mixing step used as an integer hash. `Math.imul`,
// `>>>`, `^` and `|` are all exactly specified 32-bit operations, and dividing
// by 2^32 is exact in a double, so every engine returns the same number.
function rand(seed) {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Dust drifting through the light coming off the window. */
export const MOTES = Array.from({ length: 26 }, (_, i) => ({
  x: 340 + rand(i + 1) * 940,
  y: 130 + rand(i + 51) * 400,
  r: 1.1 + rand(i + 101) * 2.4,
  delay: -(rand(i + 151) * 18).toFixed(2),
  dur: (11 + rand(i + 201) * 12).toFixed(2),
  drift: (rand(i + 251) * 60 - 30).toFixed(1),
}))

/** Lit windows in the skyline towers. */
export const CITY_WINDOWS = Array.from({ length: 54 }, (_, i) => ({
  x: 330 + Math.floor(rand(i + 301) * 46) * 20,
  y: 330 + Math.floor(rand(i + 401) * 9) * 22,
  lit: rand(i + 501) > 0.34,
  delay: -(rand(i + 601) * 9).toFixed(2),
}))

/** Ceiling pendants: horizontal position and cord length. */
export const PENDANT_LAMPS = [
  { x: 214, len: 168 },
  { x: 1392, len: 138 },
]
