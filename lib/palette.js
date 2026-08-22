import { rng } from '@/lib/seed'

/**
 * Colour discipline.
 *
 * The room is warm charcoal, wood and paper. Accents exist to *mark* things —
 * which area you are in, which person is speaking — and nothing more, so they
 * are kept to four narrow bands and to a chroma low enough that they read as
 * dyed materials rather than as lit pixels. Anything more saturated and the
 * office starts looking like a dashboard again.
 *
 * Chroma is the important half of this. The same hue at 0.18 is neon and at
 * 0.075 is a paint chip; every accent in the app is written against
 * {@link ACCENT_CHROMA} for that reason.
 */
export const ACCENT_CHROMA = 0.075

const BANDS = [
  { from: 22, to: 46, weight: 0.34 }, // clay, amber, terracotta
  { from: 48, to: 74, weight: 0.18 }, // brass, ochre
  { from: 104, to: 142, weight: 0.2 }, // moss, olive, sage
  { from: 218, to: 262, weight: 0.28 }, // dusty slate blue
]

const TOTAL = BANDS.reduce((sum, band) => sum + band.weight, 0)

/**
 * @param {number} seed
 * @returns {number} degrees, always inside one of the four bands
 */
export function moodHue(seed, salt = 0) {
  const next = rng((seed ^ 0x2f6d) + salt * 0x9e3779b9)
  let roll = next() * TOTAL
  for (const band of BANDS) {
    if (roll < band.weight) return Math.round(band.from + next() * (band.to - band.from))
    roll -= band.weight
  }
  return 32
}

/**
 * How far a person's marker drifts from the colour of the space they are in.
 *
 * People are tinted by the room. Thirty unrelated colours standing on one floor
 * reads as confetti and destroys the sense that they are all in the same place
 * under the same light — so the variation is small, and someone's true colour
 * only appears where they are actually named.
 *
 * @returns {number} degrees to add to the area hue, roughly ±18
 */
export function tintOffset(seed) {
  const next = rng(seed ^ 0x7c1b)
  return Math.round((next() - 0.5) * 36)
}
