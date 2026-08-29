/**
 * The world outside the windscreen.
 *
 * Everything in here is pure: it takes a canvas context, a description of the
 * viewport, and a mutable `world` object owned by the component, and paints one
 * frame. No React, no state, no allocation in the hot path — the render loop
 * calls `drawScene` sixty times a second and it must not make garbage.
 *
 * THE PROJECTION
 * There is no 3D here and no matrix maths. The road is drawn one scanline at a
 * time from the bottom of the canvas up to the horizon, and the only trick is
 * that a row `p` pixels below the horizon is showing you the ground at world
 * distance `z = camZ / p`. That single reciprocal is the entire perspective:
 * rows near the bottom cover a metre each, rows near the horizon cover a
 * hundred, so anything spaced evenly in the world compresses toward the horizon
 * for free — stripes, bands, palm trees, all of it.
 *
 * The road bends by accumulating a sideways delta up the rows rather than by
 * curving any geometry. `x += dx; dx += g` per row integrates twice, so the
 * offset grows with the square of the distance, which is what a real curve
 * looks like from a car.
 */

/** Lanes across the road. The car starts in the middle one, so keep it odd. */
export const LANES = 5

/** Half the road's width at the bottom of the screen, as a fraction of canvas width. */
const ROAD_HALF_RATIO = 0.42

/** Where the horizon sits before hills move it. */
const HORIZON_RATIO = 0.44

/**
 * World units between the light/dark tarmac bands that sweep toward you.
 *
 * Short, and it has to be: the reciprocal projection puts z=3 at the bottom of
 * the frame and z=15 a fifth of the way up it, so a fifteen-metre band would
 * paint the entire near field as one flat slab and the road would look still
 * even at speed. Five metres gives three or four bands in view and about seven
 * sweeping past a second at cruise, which is where the sense of speed lives.
 */
const BAND_LENGTH = 5

/** World units per lane-marking cycle, and how much of that cycle is painted. */
const DASH_LENGTH = 8
const DASH_DUTY = 0.44

/** Rows are measured every pixel but only painted every `ROW_STEP`. */
const ROW_STEP = 2

/**
 * World units between roadside prop slots, and how many slots stay loaded.
 *
 * A world unit is a metre. That is worth stating because the projection makes
 * it easy to get wrong: only about the first 30 units are spread across the
 * bottom 90% of the screen, so a constant that looks small here — a 27m gap
 * between palm trees — is already most of the visible road.
 */
const PROP_SPACING = 11
const PROP_SLOTS = 56

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a, b, t) => a + (b - a) * t
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

/** `[r,g,b]` to a canvas fill string. Commas, not spaces — widest support. */
const css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

/**
 * The integer sibling of `lib/seed`'s string `hash`. Roadside scenery is a pure
 * function of its slot number, so a palm tree is in the same place every time
 * that stretch of road comes round, and nothing has to be stored between frames.
 */
function ihash(n) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}
const unit = (n) => ihash(n) / 4294967296

/* ───────────────────────────────────────────────────────────────────────────
   THEMES

   Three worlds, and which one you drive through depends on what time it
   actually is where you are: coast by day, alpine at dusk, Tokyo after dark.
   Each is a flat bag of colours plus four switches — what hangs in the sky,
   what stands on the horizon, what grows beside the road, and whether the road
   is wet. Adding a fourth theme is a matter of adding an entry here.

   THE RULE EVERY PALETTE HAS TO KEEP: the road must be a clear step away from
   the ground in lightness. Get that wrong and the tarmac vanishes into the
   landscape; the shapes are all still being drawn, you simply cannot see them.

   Note that `ridge` and `solid` solve opposite problems and cannot be the same
   colour. `ridge` is the horizon line, read against the *sky*, and so wants to
   be dark. `solid` is the scenery beside the road, read against the *ground* —
   so under a night sky, where the ground is nearly black, it has to go the
   other way and be lighter than what it stands on. Tokyo gets pale concrete
   for exactly that reason, while the same buildings by day would be silhouettes.
   ────────────────────────────────────────────────────────────────────────── */

/** @typedef {'sun'|'lowsun'|'moon'} SkyBody */
/** @typedef {'cliff'|'pine'|'skyline'} Horizon */
/** @typedef {'cypress'|'conifer'|'sign'} Roadside */

export const THEMES = [
  {
    id: 'coast',
    name: 'Cliff Road',
    plate: 'DAY',
    when: 'Daytime',
    body: /** @type {SkyBody} */ ('sun'),
    ridgeKind: /** @type {Horizon} */ ('cliff'),
    roadside: /** @type {Roadside} */ ('cypress'),
    wet: 0,
    vignette: 0.3,
    skyTop: [72, 154, 226],
    skyHorizon: [198, 230, 246],
    sunHigh: [255, 252, 232],
    sunLow: [255, 228, 158],
    sea: [40, 166, 178],
    groundA: [206, 180, 134],
    groundB: [222, 198, 152],
    roadA: [92, 92, 97],
    roadB: [106, 106, 112],
    rumbleA: [226, 78, 66],
    rumbleB: [246, 245, 241],
    lane: [250, 248, 242],
    solid: [58, 86, 58],
    glow: [255, 244, 200],
    fog: [206, 228, 238],
    fogStrength: 0.62,
    accent: [16, 176, 178],
    ridge: [86, 112, 92],
    stars: 0,
  },
  {
    id: 'alpine',
    name: 'Pass at Dusk',
    plate: 'DUSK',
    when: 'Evening',
    body: 'lowsun',
    ridgeKind: 'pine',
    roadside: 'conifer',
    wet: 0,
    vignette: 0.46,
    skyTop: [34, 44, 78],
    skyHorizon: [214, 148, 116],
    sunHigh: [255, 220, 176],
    sunLow: [236, 132, 92],
    sea: [96, 108, 134],
    groundA: [146, 158, 178],
    groundB: [168, 180, 198],
    roadA: [50, 52, 60],
    roadB: [60, 63, 73],
    rumbleA: [212, 74, 62],
    rumbleB: [240, 242, 248],
    lane: [238, 240, 246],
    solid: [24, 38, 36],
    glow: [255, 194, 132],
    fog: [186, 174, 184],
    fogStrength: 1,
    accent: [255, 166, 108],
    ridge: [38, 50, 64],
    stars: 0.38,
  },
  {
    id: 'tokyo',
    name: 'Wet Streets',
    plate: 'NIGHT',
    when: 'Night',
    body: 'moon',
    ridgeKind: 'skyline',
    roadside: 'sign',
    wet: 1,
    vignette: 0.58,
    skyTop: [5, 7, 16],
    skyHorizon: [44, 26, 66],
    sunHigh: [206, 218, 240],
    sunLow: [118, 138, 180],
    sea: [22, 26, 44],
    groundA: [11, 11, 19],
    groundB: [17, 17, 27],
    roadA: [27, 28, 36],
    roadB: [34, 35, 45],
    rumbleA: [232, 40, 98],
    rumbleB: [230, 238, 255],
    lane: [224, 230, 244],
    solid: [42, 46, 60],
    glow: [255, 58, 132],
    fog: [52, 34, 74],
    fogStrength: 0.95,
    accent: [86, 226, 255],
    ridge: [11, 13, 23],
    stars: 0.5,
  },
]

/**
 * Which theme it is right now.
 *
 * Must be called from an effect, never during render — the server and the
 * browser are not in the same time zone and would disagree about what hour it
 * is, which is a hydration mismatch dressed up as a sunset.
 *
 * @param {number} hour local hour, 0–23
 * @returns {number} index into {@link THEMES}
 */
export function themeForHour(hour) {
  if (hour >= 6 && hour < 17) return 0 // coast, daytime
  if (hour >= 17 && hour < 21) return 1 // alpine, evening
  return 2 // tokyo, night
}

/**
 * The palette for one frame: every colour already blended between the outgoing
 * and incoming biome and already turned into a string, so the scanline loop
 * below can assign `fillStyle` without building anything.
 */
function paletteFor(from, to, t) {
  const at = (key) => mix(from[key], to[key], t)
  const accent = at('accent')
  return {
    skyTop: at('skyTop'),
    skyHorizon: at('skyHorizon'),
    sunHigh: at('sunHigh'),
    sunLow: at('sunLow'),
    groundA: css(at('groundA')),
    groundB: css(at('groundB')),
    groundRaw: at('groundB'),
    roadA: css(at('roadA')),
    roadB: css(at('roadB')),
    rumbleA: css(at('rumbleA')),
    rumbleB: css(at('rumbleB')),
    lane: css(at('lane')),
    solidRaw: at('solid'),
    solid: css(at('solid')),
    glowRaw: at('glow'),
    glow: css(at('glow')),
    // Pulled most of the way toward the sky it sits under. Haze is scattered
    // sky light, so a horizon fog in its own colour leaves a visible seam right
    // where the ground meets the sky — the one edge in the frame that has to
    // disappear for any of this to read as distance.
    fogRaw: mix(at('fog'), at('skyHorizon'), 0.55),
    ridgeRaw: at('ridge'),
    seaRaw: at('sea'),
    accentRaw: accent,
    accent: css(accent),
    stars: lerp(from.stars, to.stars, t),
    // Switches, blended too. Crossing from a dry theme into a wet one brings
    // the rain up gradually instead of turning it on for one frame.
    wet: lerp(from.wet, to.wet, t),
    vignette: lerp(from.vignette, to.vignette, t),
    // Bright themes need far less of it: a pale haze over pale sand washes the
    // whole mid-ground out, where the same haze over dark tarmac just reads as
    // depth.
    fogStrength: lerp(from.fogStrength, to.fogStrength, t),
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   SCENE
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Scratch space that outlives a frame: the road's centre line and half-width
 * for every scanline, filled during the road pass and read back afterwards so
 * scenery and the car can sit on the tarmac without recomputing the curve.
 */
export function createScene() {
  return {
    rows: 0,
    centerAt: null,
    halfAt: null,
    horizon: 0,
    camZ: 1,
    halfNear: 1,
    // Dust thrown up off the tarmac. Allocated once and recycled forever — a
    // particle system that news up objects is a particle system that stutters
    // every time the collector runs.
    dust: Array.from({ length: 56 }, () => ({ life: 0, x: 0, y: 0, vx: 0, vy: 0, size: 0 })),
    dustAt: 0,
  }
}

/**
 * Kick up one puff behind the car. Called by the loop while a wheel is off the
 * tarmac; overwrites the oldest particle rather than growing the pool.
 *
 * @param {number} x  screen x of the wheel
 * @param {number} y  screen y of the contact patch
 * @param {number} speedRatio 0–1, how hard it is being thrown
 */
export function kickDust(scene, x, y, speedRatio, spread) {
  const p = scene.dust[scene.dustAt]
  scene.dustAt = (scene.dustAt + 1) % scene.dust.length
  p.life = 1
  p.x = x + (unit(scene.dustAt * 13) - 0.5) * spread
  p.y = y
  p.vx = (unit(scene.dustAt * 17) - 0.5) * 90 * speedRatio
  p.vy = -30 - unit(scene.dustAt * 23) * 70 * speedRatio
  p.size = spread * (0.3 + unit(scene.dustAt * 29) * 0.5)
}

function ensureRows(scene, height) {
  if (scene.rows === height) return
  scene.rows = height
  scene.centerAt = new Float32Array(height + 2)
  scene.halfAt = new Float32Array(height + 2)
}

/**
 * Smoothed value noise: a random value at every integer, eased between them.
 *
 * The whole road is built out of this. Sine waves were the obvious way to do it
 * and they are the wrong way — a sum of sines is *always* curving, so the road
 * leans one way, then leans the other, forever. There is never a straight to
 * accelerate down and never a corner that arrives. Noise gives corners of
 * different lengths and severities in an order you cannot anticipate.
 */
function noise(x) {
  const i = Math.floor(x)
  const f = x - i
  const t = f * f * (3 - 2 * f)
  return unit(i) + (unit(i + 1) - unit(i)) * t
}

const smoothstep = (t) => t * t * (3 - 2 * t)

/**
 * Pushes a signed value away from zero, keeping the sign and the ends.
 *
 * Interpolated noise is the average of two uniforms, so it piles up in the
 * middle: left alone, the road spends most of its length almost — but not
 * quite — straight, which is the least interesting thing a road can do. This
 * spreads that pile out toward the extremes so corners commit to being corners.
 */
const expand = (v, k) => Math.sign(v) * Math.abs(v) ** k

/**
 * Where the road is bending, in [-1, 1]. Two octaves of noise, then flattened
 * through a dead zone.
 *
 * The dead zone is the important half. Raw noise is never quite zero, so the
 * road would still be permanently, slightly bent — the exact problem the sines
 * had. Squashing everything under a threshold to flat zero buys real straights,
 * and rescaling what is left buys corners with some bite. It is smoothstepped
 * back in rather than clipped so curvature stays continuous at the threshold;
 * a hard cut puts a visible kink in the road every time a corner starts.
 */
const CURVE_DEAD = 0.16
const CURVE_SPAN = 1.5

export function curveAt(travel) {
  const broad = expand(noise(travel * 0.0016) * 2 - 1, 0.65) // corners ~600m apart
  const tight = expand(noise(travel * 0.0072 + 31.7) * 2 - 1, 0.65) // kinks within them
  const raw = broad + tight * 0.5

  const magnitude = Math.abs(raw)
  if (magnitude <= CURVE_DEAD) return 0
  return (
    Math.sign(raw) *
    smoothstep(Math.min(1, (magnitude - CURVE_DEAD) / (CURVE_SPAN - CURVE_DEAD)))
  )
}

/**
 * How much the horizon rises and falls. Hills, without any hill geometry — and
 * with enough amplitude to actually crest, so the road ahead disappears over
 * the top of one and drops away into the next.
 */
function hillAt(travel, height) {
  const long = noise(travel * 0.0011 + 5.3) * 2 - 1
  const short = noise(travel * 0.0043 + 19.1) * 2 - 1
  return (long * 0.72 + short * 0.34) * height * 0.072
}

/**
 * Paint one frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<createScene>} scene
 * @param {{w: number, h: number}} view
 * @param {object} world  mutable state owned by the component: travel, speed,
 *   playerX, tilt, brake, elapsed, energy, kick, reduced
 */
export function drawScene(ctx, scene, view, world) {
  const { w, h } = view
  ensureRows(scene, h)

  // Which world we are in is decided by the clock, not by distance — the
  // component owns the indices and eases `themeBlend` from 0 to 1 whenever they
  // change, so dusk arriving mid-drive is a crossfade rather than a cut.
  const from = THEMES[world.themeFrom] ?? THEMES[0]
  const to = THEMES[world.themeTo] ?? from
  const blend = clamp(world.themeBlend, 0, 1)
  const pal = paletteFor(from, to, blend)

  const horizon = Math.round(h * HORIZON_RATIO + hillAt(world.travel, h))
  const rows = h - horizon
  if (rows < 8) return

  const halfNear = w * ROAD_HALF_RATIO
  // The nearest visible tarmac sits about three units in front of the bumper.
  const camZ = rows * 3
  scene.horizon = horizon
  scene.camZ = camZ
  scene.halfNear = halfNear

  const bend = curveAt(world.travel)
  // Set by the loop, so top speed is defined in exactly one place.
  const speedRatio = clamp(world.speedRatio, 0, 1)
  // Two sources: a gentle pulse on the beat, and a hard rattle off the tarmac.
  const shake = world.reduced
    ? 0
    : world.kick * speedRatio * 2.2 + world.offroad * speedRatio * 9

  ctx.save()
  // Vertical for the beat, lateral only when the wheels are in the dirt — a
  // sideways camera on smooth tarmac reads as a bug, not as a bump.
  ctx.translate(Math.sin(world.elapsed * 47) * shake * 0.4, shake)

  drawSky(ctx, w, h, horizon, pal, from, to, blend, world)
  drawRidge(ctx, w, horizon, pal, from, to, blend, world, bend)
  drawRoad(ctx, scene, view, world, pal, horizon, rows, halfNear, camZ, bend)
  drawRoadside(ctx, scene, view, world, pal, from, to, blend)
  // Reflections go on before the haze, so distance washes them out with
  // everything else standing on the road.
  if (pal.wet > 0.01) drawWetSheen(ctx, scene, view, pal, world, horizon, rows)
  drawFog(ctx, w, horizon, rows, pal)
  drawDust(ctx, scene, pal, world)
  drawCar(ctx, scene, view, world, pal)

  ctx.restore()

  if (!world.reduced) drawSpeedLines(ctx, w, h, horizon, speedRatio, world, pal)
  if (pal.wet > 0.01 && !world.reduced) drawRain(ctx, w, h, pal, world)
  drawVignette(ctx, w, h, pal.vignette)

  // Handed back to the HUD so the dashboard can tint itself to match the
  // landscape without React re-rendering on every frame.
  world.biomeName = blend > 0.5 ? to.name : from.name
  world.biomePlate = blend > 0.5 ? to.plate : from.plate
  world.accent = pal.accentRaw
}

/* ── sky ──────────────────────────────────────────────────────────────────── */

function drawSky(ctx, w, h, horizon, pal, from, to, blend, world) {
  const sky = ctx.createLinearGradient(0, -8, 0, horizon)
  sky.addColorStop(0, css(pal.skyTop))
  sky.addColorStop(1, css(pal.skyHorizon))
  ctx.fillStyle = sky
  ctx.fillRect(-8, -8, w + 16, horizon + 8)

  if (pal.stars > 0.02) drawStars(ctx, w, horizon, pal, world)

  // Non-colour features cannot be lerped, so both biomes' sky bodies are drawn
  // and cross-faded by opacity instead.
  if (blend < 1) drawSkyBody(ctx, w, horizon, pal, from.body, 1 - blend, world)
  if (blend > 0) drawSkyBody(ctx, w, horizon, pal, to.body, blend, world)
}

function drawStars(ctx, w, horizon, pal, world) {
  const count = 90
  ctx.fillStyle = '#fff'
  for (let i = 0; i < count; i += 1) {
    const x = unit(i * 3 + 11) * w
    const y = unit(i * 3 + 12) * horizon * 0.82
    const base = unit(i * 3 + 13)
    // Stars breathe with the track rather than twinkling at random.
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(world.elapsed * (0.6 + base) + i))
    ctx.globalAlpha = pal.stars * base * twinkle * 0.9
    const size = base > 0.93 ? 2 : 1
    ctx.fillRect(x, y, size, size)
  }
  ctx.globalAlpha = 1
}

function drawSkyBody(ctx, w, horizon, pal, kind, alpha, world) {
  const cx = w * 0.5
  const r = Math.min(w * 0.17, horizon * 0.62)
  // A midday sun rides high and small; a setting one sits on the horizon and
  // reads twice the size. Same circle, different height and radius.
  const high = kind === 'sun'
  const radius = high ? r * 0.36 : r
  const cy = high ? horizon - r * 1.5 : horizon - r * 0.34
  ctx.save()
  ctx.globalAlpha = alpha

  if (kind === 'moon') {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.1)
    glow.addColorStop(0, rgba(pal.sunHigh, 0.3))
    glow.addColorStop(1, rgba(pal.sunHigh, 0))
    ctx.fillStyle = glow
    ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4)

    // Full, not a crescent. Punching the bite out with a flat fill needs the
    // exact sky colour at that height — the gradient means there isn't one — and
    // being a shade off turns the moon into a hole in the sky.
    const disc = r * 0.42
    ctx.beginPath()
    ctx.arc(cx, cy, disc, 0, Math.PI * 2)
    ctx.fillStyle = css(pal.sunHigh)
    ctx.fill()
    // Maria. Just enough to stop it reading as a plain circle.
    ctx.fillStyle = rgba(pal.sunLow, 0.4)
    ctx.beginPath()
    ctx.arc(cx - disc * 0.3, cy - disc * 0.22, disc * 0.3, 0, Math.PI * 2)
    ctx.arc(cx + disc * 0.26, cy + disc * 0.3, disc * 0.22, 0, Math.PI * 2)
    ctx.arc(cx + disc * 0.1, cy - disc * 0.45, disc * 0.14, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  // Bloom. A bare disc on a gradient reads as a sticker; the halo is what makes
  // it a light source, and it does most of the work of selling the hour.
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * (high ? 5 : 2.4))
  halo.addColorStop(0, rgba(pal.sunHigh, high ? 0.5 : 0.34))
  halo.addColorStop(1, rgba(pal.sunHigh, 0))
  ctx.fillStyle = halo
  ctx.fillRect(cx - radius * 5, cy - radius * 5, radius * 10, radius * 10)

  const disc = ctx.createLinearGradient(0, cy - radius, 0, cy + radius)
  disc.addColorStop(0, css(pal.sunHigh))
  disc.addColorStop(1, css(pal.sunLow))

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = disc
  ctx.fill()

  if (kind === 'lowsun') {
    // The sun is sitting in its own haze at this hour, so it gets banded by it.
    // Pulsing the bands on the beat is the cheapest audio reactivity there is
    // and it reads at a glance, which is the point of it.
    ctx.fillStyle = css(pal.skyHorizon)
    for (let i = 0; i < 5; i += 1) {
      const t = i / 5
      const y = cy + radius * (0.18 + t * 0.86)
      const bump = world.reduced ? 0 : world.kick * 1.2
      ctx.globalAlpha = alpha * (0.5 - t * 0.3)
      ctx.fillRect(cx - radius, y - bump * 0.5, radius * 2, 1.5 + t * radius * 0.1 + bump)
    }
  }
  ctx.restore()
}

/** A silhouette band on the horizon, parallaxing far slower than the road. */
function drawRidge(ctx, w, horizon, pal, from, to, blend, world, bend) {
  const drift = -world.travel * 0.055 - bend * w * 0.14
  if (blend < 1) drawRidgeBand(ctx, w, horizon, pal, from, 1 - blend, drift, world)
  if (blend > 0) drawRidgeBand(ctx, w, horizon, pal, to, blend, drift * 1.3, world)
}

function drawRidgeBand(ctx, w, horizon, pal, biome, alpha, drift, world) {
  ctx.save()
  ctx.globalAlpha = alpha
  const silhouette = css(mix(pal.ridgeRaw, biome.ridge, 0.5))
  ctx.fillStyle = silhouette

  // The sea, before anything stands in front of it. A strip right at the
  // horizon rather than a plane, because from a cliff road at this distance
  // that is all of it you would actually see.
  if (biome.ridgeKind === 'cliff') {
    const depth = Math.max(6, horizon * 0.055)
    const sea = ctx.createLinearGradient(0, horizon - depth, 0, horizon)
    sea.addColorStop(0, rgba(mix(pal.seaRaw, pal.skyHorizon, 0.45), 0.95))
    sea.addColorStop(1, css(pal.seaRaw))
    ctx.fillStyle = sea
    ctx.fillRect(-8, horizon - depth, w + 16, depth)
    // Sun glitter on the water, drifting with the road.
    ctx.fillStyle = rgba(pal.sunHigh, 0.5)
    for (let g = 0; g < 26; g += 1) {
      const roll = unit(g * 19 + 3)
      const gx = ((roll * w * 1.4 - drift * 0.35) % (w + 40)) - 20
      ctx.globalAlpha = alpha * (0.15 + 0.35 * Math.abs(Math.sin(world.elapsed * 1.3 + g)))
      ctx.fillRect(gx, horizon - depth * (0.15 + roll * 0.7), 3 + roll * 7, 1)
    }
    ctx.globalAlpha = alpha
    ctx.fillStyle = silhouette
  }

  const span = 96
  const first = Math.floor(drift / span) - 1
  for (let i = 0; i < Math.ceil(w / span) + 3; i += 1) {
    const slot = first + i
    const x = slot * span - drift
    const roll = unit(slot * 7 + 5)

    if (biome.ridgeKind === 'pine') {
      // A wall of conifers: two overlapping rows of narrow spikes, the back row
      // paler, so the treeline has depth instead of being one cut-out.
      for (let layer = 0; layer < 2; layer += 1) {
        const back = layer === 0
        ctx.globalAlpha = alpha * (back ? 0.55 : 1)
        ctx.fillStyle = back ? css(mix(pal.ridgeRaw, pal.skyHorizon, 0.4)) : silhouette
        for (let k = 0; k < 3; k += 1) {
          const r2 = unit(slot * 41 + k * 7 + layer * 131)
          const tx = x + (k / 3) * span + (back ? span * 0.16 : 0)
          // Wide height spread, or the wall reads as a row of railings
          // rather than as a forest with big trees and small ones in it.
          const th = horizon * (back ? 0.06 + r2 * r2 * 0.2 : 0.08 + r2 * r2 * 0.34)
          const tw = span * (0.12 + r2 * 0.09)
          ctx.beginPath()
          ctx.moveTo(tx, horizon)
          ctx.lineTo(tx + tw * 0.5, horizon - th)
          ctx.lineTo(tx + tw, horizon)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.globalAlpha = alpha
      ctx.fillStyle = silhouette
      continue
    }

    if (biome.ridgeKind === 'cliff') {
      // Headlands stepping back along the coast, each a blunt trapezoid rather
      // than a peak — a cliff has a top, a mountain does not.
      // Low and uneven. Tall uniform headlands wall the sea off completely,
      // and the sea is the whole reason this is a cliff road.
      const ch = horizon * (0.04 + roll * roll * 0.2)
      const cw = span * (0.7 + unit(slot * 11 + 2) * 0.9)
      ctx.beginPath()
      ctx.moveTo(x, horizon)
      ctx.lineTo(x + cw * 0.22, horizon - ch)
      ctx.lineTo(x + cw * 0.86, horizon - ch * 0.82)
      ctx.lineTo(x + cw, horizon)
      ctx.closePath()
      ctx.fill()
      continue
    }

    {
      // Downtown: a jagged block of towers with a few lit windows. The slot
      // grid is jittered and the widths overrun it, so neighbours sometimes
      // touch or overlap — on a bare grid the skyline reads as a bar chart.
      const bw = span * (0.34 + roll * 0.82)
      const bh = horizon * (0.12 + unit(slot * 7 + 6) * 0.4)
      const jitter = (unit(slot * 7 + 9) - 0.5) * span * 0.5
      ctx.fillRect(x + jitter, horizon - bh, bw, bh)
      ctx.globalAlpha = alpha * 0.5
      ctx.fillStyle = css(pal.glowRaw)
      for (let k = 0; k < 5; k += 1) {
        if (unit(slot * 31 + k) < 0.55) continue
        const lit = 0.5 + 0.5 * Math.sin(world.elapsed * 0.7 + k + slot)
        ctx.globalAlpha = alpha * 0.16 * lit
        ctx.fillRect(x + jitter + bw * 0.2 + (k % 2) * bw * 0.4, horizon - bh + 6 + k * 9, 3, 4)
      }
      ctx.globalAlpha = alpha
      ctx.fillStyle = silhouette
    }
  }
  ctx.restore()
}

/* ── road ─────────────────────────────────────────────────────────────────── */

function drawRoad(ctx, scene, view, world, pal, horizon, rows, halfNear, camZ, bend) {
  const { w, h } = view
  const { centerAt, halfAt } = scene

  // Ground, painted once as a gradient. The scanline loop only lays alternating
  // bands over the top of it, which halves the fills per row.
  const ground = ctx.createLinearGradient(0, horizon, 0, h)
  ground.addColorStop(0, pal.groundA)
  ground.addColorStop(1, pal.groundB)
  ctx.fillStyle = ground
  ctx.fillRect(-8, horizon, w + 16, rows + 8)

  // The camera pans with the car, so some of the sideways movement you see when
  // you change lane is the road sliding under you rather than the car sliding
  // across the screen. `CAMERA_FOLLOW` splits it: this share goes to the world
  // and the rest to the car.
  //
  // Kept low deliberately. The road is 84% of the frame wide at the bumper, so
  // panning it hard pushes the far kerb off the side of the screen the moment
  // you take an outside lane — you end up driving on something with only one
  // visible edge.
  const CAMERA_FOLLOW = 0.38
  let x = w * 0.5 - world.playerX * halfNear * CAMERA_FOLLOW
  let dx = 0
  // Integrating twice up the rows makes the offset grow with the square of the
  // distance — a real curve, out of two additions per scanline. The constant is
  // the total sideways travel from the bumper to the horizon on the tightest
  // bend, as a fraction of the canvas width; push it past about 0.5 and the
  // road swings clean off the side of the frame.
  const gain = (bend * w * 0.42) / (rows * rows)

  const rumbleWidth = Math.max(3, w * 0.016)
  const dashWidth = Math.max(2, w * 0.007)
  const travel = world.travel

  for (let y = h - 1; y > horizon; y -= 1) {
    const p = y - horizon
    const persp = p / rows
    const z = camZ / p
    const half = halfNear * persp

    centerAt[y] = x
    halfAt[y] = half

    // Every row is measured; only every ROW_STEP-th row is painted.
    if ((h - 1 - y) % ROW_STEP === 0) {
      const worldZ = travel + z
      const band = (Math.floor(worldZ / BAND_LENGTH) & 1) === 1

      if (band) {
        // Windowed at both ends. A ground band is a full-width horizontal
        // stripe: in the near field one band is tall enough to cover a third of
        // the frame and reads as a seam across the picture, and up by the
        // horizon they compress to a couple of pixels and read as moiré. Only
        // the middle distance is a width where they read as travel.
        ctx.globalAlpha = (1.15 - persp) * 0.85 * Math.min(1, persp / 0.26)
        ctx.fillStyle = pal.groundB
        ctx.fillRect(-8, y, w + 16, ROW_STEP)
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = band ? pal.rumbleA : pal.rumbleB
      const rw = rumbleWidth * persp + 1
      ctx.fillRect(x - half - rw, y, rw, ROW_STEP)
      ctx.fillRect(x + half, y, rw, ROW_STEP)

      ctx.fillStyle = band ? pal.roadA : pal.roadB
      ctx.fillRect(x - half, y, half * 2, ROW_STEP)

      // Lane markings stop well before the horizon: at that compression the
      // dashes alias into a shimmering moiré, and the fog is covering them
      // anyway.
      if (persp > 0.12 && (worldZ / DASH_LENGTH) % 1 < DASH_DUTY) {
        ctx.fillStyle = pal.lane
        const dw = Math.max(1, dashWidth * persp)
        for (let li = 1; li < LANES; li += 1) {
          const lx = x + ((li / LANES) * 2 - 1) * half
          ctx.fillRect(lx - dw * 0.5, y, dw, ROW_STEP)
        }
      }
    }

    x += dx
    dx += gain
  }
}

/** Depth haze. Also quietly hides the aliasing in the last few road rows. */
function drawFog(ctx, w, horizon, rows, pal) {
  const k = pal.fogStrength
  // The tail is long and the falloff eased, because a gradient that reaches
  // zero with any slope left on it leaves a Mach band across the road — a hard
  // horizontal line that is not in the colours at all, only in your eye.
  const depth = rows * 0.58
  const fog = ctx.createLinearGradient(0, horizon, 0, horizon + depth)
  fog.addColorStop(0, rgba(pal.fogRaw, 0.95 * k))
  fog.addColorStop(0.3, rgba(pal.fogRaw, 0.48 * k))
  fog.addColorStop(0.62, rgba(pal.fogRaw, 0.15 * k))
  fog.addColorStop(0.85, rgba(pal.fogRaw, 0.03 * k))
  fog.addColorStop(1, rgba(pal.fogRaw, 0))
  ctx.fillStyle = fog
  ctx.fillRect(-8, horizon, w + 16, depth)
}

/* ── roadside ─────────────────────────────────────────────────────────────── */

function drawRoadside(ctx, scene, view, world, pal, from, to, blend) {
  const { h } = view
  const { centerAt, halfAt, horizon, camZ, halfNear } = scene
  const first = Math.floor(world.travel / PROP_SPACING)

  // Far to near, so nearer scenery paints over the things behind it.
  for (let i = PROP_SLOTS; i >= 1; i -= 1) {
    const slot = first + i
    const z = slot * PROP_SPACING - world.travel
    if (z <= 4) continue

    const p = camZ / z
    const y = horizon + p
    if (y >= h || p < 2) continue

    const row = y | 0
    const scale = halfAt[row] / halfNear
    if (scale < 0.012) continue

    for (let s = 0; s < 2; s += 1) {
      const side = s === 0 ? -1 : 1
      const roll = unit(slot * 17 + s * 991)
      if (roll > 0.62) continue

      // During a changeover each prop flips independently once the blend passes
      // its own roll, so the landscape turns over gradually instead of the whole
      // avenue swapping species on one frame.
      const kind = unit(slot * 53 + s * 7) < blend ? to.roadside : from.roadside
      // Just outside the kerb, and it has to stay there. The road is already
      // 84% of the frame wide, so anything much beyond a road-width off centre
      // is outside the viewport for its entire approach — drawn every frame,
      // seen never.
      const offset = 1.15 + unit(slot * 29 + s * 13) * 0.8
      const px = centerAt[row] + side * offset * halfAt[row]
      const height = halfNear * scale * (0.9 + unit(slot * 23 + s) * 0.7)

      ctx.globalAlpha = clamp(scale * 9, 0, 1)
      drawProp(ctx, kind, px, y, height, scale, halfNear, pal, world, slot + s)
    }
  }
  ctx.globalAlpha = 1
}

function drawProp(ctx, kind, x, baseY, height, scale, halfNear, pal, world, seed) {
  const unitW = halfNear * scale
  const alpha = clamp(scale * 9, 0, 1)

  if (kind === 'cypress') {
    // Italian cypress: a tall narrow flame. Almost all height and no width,
    // which is what makes a coast road read as a coast road.
    const cw = Math.max(1.5, unitW * 0.085)
    const ch = height * 1.5
    const lean = (unit(seed * 3) - 0.5) * cw * 1.6
    ctx.fillStyle = pal.solid
    ctx.beginPath()
    ctx.moveTo(x - cw, baseY)
    ctx.quadraticCurveTo(x - cw * 0.85, baseY - ch * 0.55, x + lean, baseY - ch)
    ctx.quadraticCurveTo(x + cw * 0.85, baseY - ch * 0.55, x + cw, baseY)
    ctx.closePath()
    ctx.fill()
    return
  }

  if (kind === 'conifer') {
    // Spruce: three stacked skirts, each narrower than the one below.
    const tw = unitW * (0.3 + unit(seed * 7) * 0.16)
    const th = height * 1.25
    ctx.fillStyle = pal.solid
    ctx.fillRect(x - tw * 0.07, baseY - th * 0.18, tw * 0.14, th * 0.18)
    for (let k = 0; k < 3; k += 1) {
      const t = k / 3
      const skirtW = tw * (1 - t * 0.42)
      const base = baseY - th * (0.12 + t * 0.3)
      ctx.beginPath()
      ctx.moveTo(x - skirtW * 0.5, base)
      ctx.lineTo(x, base - th * 0.42)
      ctx.lineTo(x + skirtW * 0.5, base)
      ctx.closePath()
      ctx.fill()
    }
    // Snow caught on the windward side of the branches.
    ctx.fillStyle = rgba(mix(pal.groundRaw, [255, 255, 255], 0.55), 0.75)
    ctx.beginPath()
    ctx.moveTo(x - tw * 0.2, baseY - th * 0.52)
    ctx.lineTo(x, baseY - th * 0.72)
    ctx.lineTo(x + tw * 0.08, baseY - th * 0.5)
    ctx.closePath()
    ctx.fill()
    return
  }

  // A neon sign on a pole. Each one picks its own colour from a three-way roll
  // rather than all glowing the same hue, because a street where every sign
  // agrees does not look like a street.
  const poleW = Math.max(1, unitW * 0.045)
  const poleH = height * (1.0 + unit(seed * 19) * 0.6)
  ctx.fillStyle = pal.solid
  ctx.fillRect(x - poleW * 0.5, baseY - poleH, poleW, poleH)

  const tint = unit(seed * 37)
  const neon = tint < 0.36 ? pal.glowRaw : tint < 0.7 ? pal.accentRaw : [255, 196, 92]
  // Kept small relative to its pole. A sign is a thing hanging on a post, and
  // sized off the pole's full height it turns into a billboard the size of the
  // building behind it.
  const boardW = unitW * (0.22 + unit(seed * 23) * 0.16)
  const boardH = poleH * (0.2 + unit(seed * 29) * 0.18)
  const boardY = baseY - poleH
  const boardX = x - boardW * 0.5

  if (scale > 0.03) {
    // Bloom first, board over it. Neon at night is mostly the air around it.
    const bloom = ctx.createRadialGradient(x, boardY + boardH * 0.5, 1, x, boardY + boardH * 0.5, boardW * 2.4)
    bloom.addColorStop(0, rgba(neon, 0.5 * alpha))
    bloom.addColorStop(1, rgba(neon, 0))
    ctx.fillStyle = bloom
    ctx.fillRect(x - boardW * 2.4, boardY - boardW * 1.4, boardW * 4.8, boardH + boardW * 2.8)
  }

  ctx.fillStyle = rgba(neon, 0.9)
  ctx.fillRect(boardX, boardY, boardW, boardH)
  // Dark strokes across it, standing in for lettering at this size.
  if (scale > 0.06) {
    ctx.fillStyle = rgba(pal.solidRaw, 0.75)
    const rows = Math.max(2, Math.floor(boardH / (unitW * 0.11)))
    for (let k = 0; k < rows; k += 1) {
      if (unit(seed * 61 + k) < 0.35) continue
      const ry = boardY + boardH * ((k + 0.35) / rows)
      ctx.fillRect(boardX + boardW * 0.16, ry, boardW * (0.3 + unit(seed * 71 + k) * 0.5), Math.max(1, boardH / rows * 0.3))
    }
  }
}

/**
 * Dust off the verge. Integrated and drawn in one pass, oldest first, so newer
 * puffs sit in front of older ones without any sorting.
 */
function drawDust(ctx, scene, pal, world) {
  const dust = scene.dust
  const dt = world.dt
  ctx.save()
  for (let i = 0; i < dust.length; i += 1) {
    const p = dust[i]
    if (p.life <= 0) continue
    p.life -= dt * 1.5
    if (p.life <= 0) continue
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 46 * dt // settling back down
    p.vx *= 1 - dt * 1.4

    // Tinted by the ground it came off, so the desert throws sand and downtown
    // throws grit without either needing its own particle code.
    ctx.globalAlpha = p.life * p.life * 0.5
    ctx.fillStyle = css(mix(pal.groundRaw, [255, 255, 255], 0.35))
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * (1.6 - p.life), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/* ── the car ──────────────────────────────────────────────────────────────── */

/**
 * Drawn from behind in flat shapes. There is no sprite to load, which means the
 * car can be recoloured by the biome and can squash, roll and light up on the
 * beat without any art pipeline at all.
 */
function drawCar(ctx, scene, view, world, pal) {
  const { w, h } = view
  const { centerAt, halfAt } = scene
  // Not right at the bottom of the frame: the dashboard's scrim covers the last
  // fifth of it, and a car parked under the track title is a car you cannot see.
  const row = Math.min(h - 2, Math.round(h * 0.78))
  const half = halfAt[row]
  if (!half) return

  const x = centerAt[row] + world.playerX * half
  const laneWidth = (half * 2) / LANES
  const carW = clamp(laneWidth * 0.78, w * 0.06, w * 0.2)
  const carH = carW * 0.62

  const speedRatio = clamp(world.speedRatio, 0, 1)
  const bob = world.reduced
    ? 0
    : Math.sin(world.elapsed * 11) * 1.1 * speedRatio +
      world.kick * 2.4 * speedRatio +
      // Bucking over the rough stuff, fast and irregular enough not to read as
      // a rhythm.
      Math.sin(world.elapsed * 39) * world.offroad * speedRatio * 3.5
  const y = row - bob

  // Handed back so the loop can throw dust from the contact patches next frame.
  world.carX = x
  world.carY = y
  world.carW = carW

  ctx.save()
  ctx.translate(x, y)
  // Rolls into the turn. `tilt` is how far the car still has to travel to reach
  // the lane it was told to go to, so the lean appears and unwinds on its own.
  ctx.rotate(clamp(world.tilt, -1, 1) * 0.14)

  // Contact shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.ellipse(0, carH * 0.16, carW * 0.62, carH * 0.17, 0, 0, Math.PI * 2)
  ctx.fill()

  const body = ctx.createLinearGradient(0, -carH, 0, carH * 0.2)
  body.addColorStop(0, '#f2f4f8')
  body.addColorStop(0.45, '#c9ced9')
  body.addColorStop(1, '#6f7684')
  ctx.fillStyle = body
  roundRect(ctx, -carW * 0.5, -carH * 0.78, carW, carH * 0.92, carW * 0.11)
  ctx.fill()
  // A dark rim, so the car keeps its shape against pale desert tarmac as well
  // as against a black road at midnight.
  ctx.strokeStyle = 'rgba(8,10,16,0.65)'
  ctx.lineWidth = Math.max(1, carW * 0.02)
  ctx.stroke()

  // Cabin, sunk into the body.
  ctx.fillStyle = 'rgba(12,16,26,0.92)'
  roundRect(ctx, -carW * 0.33, -carH * 1.06, carW * 0.66, carH * 0.42, carW * 0.06)
  ctx.fill()

  // Rear wing.
  ctx.fillStyle = '#2b3240'
  ctx.fillRect(-carW * 0.46, -carH * 1.2, carW * 0.92, carH * 0.1)
  ctx.fillRect(-carW * 0.36, -carH * 1.2, carW * 0.06, carH * 0.2)
  ctx.fillRect(carW * 0.3, -carH * 1.2, carW * 0.06, carH * 0.2)

  // Wheels, splayed out past the body so it reads as sitting on the road.
  ctx.fillStyle = '#14171f'
  roundRect(ctx, -carW * 0.6, -carH * 0.5, carW * 0.16, carH * 0.6, carW * 0.04)
  ctx.fill()
  roundRect(ctx, carW * 0.44, -carH * 0.5, carW * 0.16, carH * 0.6, carW * 0.04)
  ctx.fill()

  // Tail lights. Full brightness under braking — which is exactly what a pause
  // is — and a dimmer pulse on the beat the rest of the time.
  const brake = clamp(world.brake, 0, 1)
  const heat = clamp(0.35 + brake * 0.65 + world.kick * 0.25, 0, 1)
  const lightW = carW * 0.3
  const lightH = carH * 0.15
  const lightY = -carH * 0.5

  const glow = ctx.createRadialGradient(0, lightY, 1, 0, lightY, carW * 0.9)
  glow.addColorStop(0, `rgba(255,60,70,${0.34 * heat})`)
  glow.addColorStop(1, 'rgba(255,60,70,0)')
  ctx.fillStyle = glow
  ctx.fillRect(-carW, lightY - carW * 0.9, carW * 2, carW * 1.8)

  ctx.fillStyle = `rgba(255,${60 + 90 * (1 - heat)},${70 + 60 * (1 - heat)},${0.55 + heat * 0.45})`
  roundRect(ctx, -carW * 0.44, lightY, lightW, lightH, lightH * 0.4)
  ctx.fill()
  roundRect(ctx, carW * 0.14, lightY, lightW, lightH, lightH * 0.4)
  ctx.fill()

  // Exhaust flare, on the beat and only when actually moving.
  if (!world.reduced && world.kick > 0.35 && speedRatio > 0.15) {
    ctx.globalAlpha = (world.kick - 0.35) * speedRatio
    ctx.fillStyle = pal.glow
    ctx.beginPath()
    ctx.ellipse(-carW * 0.2, carH * 0.1, carW * 0.07, carH * 0.09, 0, 0, Math.PI * 2)
    ctx.ellipse(carW * 0.2, carH * 0.1, carW * 0.07, carH * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function roundRect(ctx, x, y, width, height, r) {
  const radius = Math.min(r, width * 0.5, height * 0.5)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

/* ── overlays ─────────────────────────────────────────────────────────────── */

/** Streaks down the sides of the frame. They only show up when you are quick. */
function drawSpeedLines(ctx, w, h, horizon, speedRatio, world, pal) {
  const intensity = clamp((speedRatio - 0.45) / 0.55, 0, 1) * (0.5 + world.energy * 0.5)
  if (intensity <= 0.01) return
  // Pinned to the outer edges of the frame and streaming outward. Anywhere
  // nearer the middle they stop reading as motion blur and start reading as
  // scratches on the lens.
  ctx.save()
  ctx.strokeStyle = rgba(pal.accentRaw, 0.4)
  ctx.lineCap = 'round'
  for (let i = 0; i < 12; i += 1) {
    const roll = unit(i * 31 + 3)
    const side = i % 2 === 0 ? -1 : 1
    const phase = (world.travel * 0.11 + roll * 3.7) % 1
    // Eased so streaks accelerate as they sweep past, the way the road does.
    const swept = phase * phase
    const y = horizon + (h - horizon) * (0.28 + roll * 0.66)
    const edge = w * 0.5 + side * w * 0.5
    const from = edge - side * w * 0.2 * (1 - swept)
    const len = (70 + roll * 110) * intensity
    ctx.lineWidth = 1 + roll * 1.6
    // Fade in and out at both ends so nothing pops into or out of existence.
    ctx.globalAlpha = Math.sin(phase * Math.PI) * intensity * 0.7
    ctx.beginPath()
    ctx.moveTo(from, y)
    ctx.lineTo(from + side * len, y + len * 0.18)
    ctx.stroke()
  }
  ctx.restore()
}

function drawVignette(ctx, w, h, strength) {
  const v = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.32, w * 0.5, h * 0.5, Math.max(w, h) * 0.78)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, `rgba(0,0,0,${strength})`)
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)
}

/**
 * Wet tarmac.
 *
 * Two things make a road look wet, and neither of them is a texture. The first
 * is that it becomes a mirror at a glancing angle, so it picks up the colour of
 * the sky most strongly far away and least underfoot. The second is vertical
 * smears of whatever is lit beside it — the smears are what your eye actually
 * reads as "wet", and they stretch *toward the camera* because that is the
 * direction the reflection is compressed in.
 */
function drawWetSheen(ctx, scene, view, pal, world, horizon, rows) {
  const { w } = view
  const { centerAt, halfAt } = scene
  ctx.save()
  ctx.globalAlpha = pal.wet

  // The mirror: sky colour laid over the road, strongest at distance.
  const sheen = ctx.createLinearGradient(0, horizon, 0, horizon + rows * 0.75)
  sheen.addColorStop(0, rgba(pal.skyHorizon, 0.34))
  sheen.addColorStop(0.5, rgba(pal.skyHorizon, 0.1))
  sheen.addColorStop(1, rgba(pal.skyHorizon, 0))
  ctx.fillStyle = sheen
  ctx.fillRect(-8, horizon, w + 16, rows * 0.75)

  // The smears. Anchored to the road's own width so they lie on the tarmac and
  // swim with it through a corner rather than sitting on the screen.
  //
  // Narrow, long, faint, and drawn additively. All four matter: a reflection is
  // light *on* a surface, so it adds rather than covers, and it is stretched
  // along the viewing direction. Painted wide and opaque — which is the obvious
  // way to do it — you get coloured boxes standing on the road instead.
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 11; i += 1) {
    const roll = unit(i * 53 + 7)
    // Each smear runs on its own loop down the screen, offset so they never
    // arrive in step.
    const phase = (((world.travel * 0.045 + roll * 5.1) % 1) + 1) % 1
    const top = horizon + rows * 0.14 + phase * rows * 0.78
    const len = rows * (0.2 + roll * 0.26)
    const row = clamp(Math.round(top), horizon + 1, horizon + rows - 1)
    const lateral = (unit(i * 71 + 3) * 2 - 1) * 0.92
    const x = centerAt[row] + lateral * halfAt[row]
    const width = Math.max(1.5, halfAt[row] * (0.012 + roll * 0.022))

    const tint = roll < 0.4 ? pal.glowRaw : roll < 0.72 ? pal.accentRaw : [255, 196, 92]
    // Fades at both ends, so a smear has no edge anywhere — it emerges and goes.
    const smear = ctx.createLinearGradient(0, top, 0, top + len)
    smear.addColorStop(0, rgba(tint, 0))
    smear.addColorStop(0.35, rgba(tint, 0.2 * pal.wet))
    smear.addColorStop(1, rgba(tint, 0))
    ctx.fillStyle = smear
    ctx.fillRect(x - width * 0.5, top, width, len)
  }
  ctx.restore()
}

/** Rain, over everything. Falls fast and near-vertical, raked by the speed. */
function drawRain(ctx, w, h, pal, world) {
  ctx.save()
  ctx.globalAlpha = pal.wet
  ctx.strokeStyle = rgba(mix(pal.skyHorizon, [255, 255, 255], 0.55), 0.4)
  ctx.lineWidth = 1
  const rake = 4 + world.speedRatio * 16
  for (let i = 0; i < 120; i += 1) {
    const roll = unit(i * 11 + 5)
    const fall = 780 + roll * 900
    const len = 14 + roll * 26
    // The modulo wraps each drop back to the top; the seed keeps it in its own
    // column so the field never looks like it is scrolling as a sheet.
    const y = ((world.elapsed * fall + roll * h * 4) % (h + len)) - len
    const x = ((unit(i * 29 + 13) * (w + 120) - world.elapsed * 60) % (w + 120) + w + 120) % (w + 120) - 60
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - rake * (len / 40), y + len)
    ctx.stroke()
  }
  ctx.restore()
}
