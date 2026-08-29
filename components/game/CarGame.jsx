'use client'

import { useEffect, useRef, useState } from 'react'
import { useAudioEnergy } from '@/hooks/useAudioEnergy'
import { useDriveControls } from '@/hooks/useDriveControls'
import { THEMES, createScene, curveAt, drawScene, kickDust, themeForHour } from '@/lib/drive/world'

/* ───────────────────────────────────────────────────────────────────────────
   THE CAR

   A world unit is a metre and the road is ten of them wide, so everything here
   is in real units: forces in m/s², speeds in m/s, and the dashboard multiplies
   by 3.6 to show km/h.

   Speed is the sum of four forces rather than a number eased toward a target.
   That is what makes it feel like a car: you get a fast pull away from a
   standstill and a long crawl to the top end, coasting bleeds speed on its own,
   and the terminal speed falls out of the drag equation instead of being
   declared. On the dirt only one constant changes and the whole handling model
   follows.
   ────────────────────────────────────────────────────────────────────────── */

/** Engine, brakes, handbrake. Metres per second squared. */
const THROTTLE_FORCE = 16
const BRAKE_FORCE = 26
const HANDBRAKE_FORCE = 36

/** Air drag (with v²) and rolling resistance (with v). These set the top speed:
 *  16 = 0.0024v² + 0.10v solves to about 63 m/s, or 228 km/h. */
const DRAG_K = 0.0024
const ROLL_K = 0.1

/** Rolling resistance multiplier once a wheel leaves the tarmac. The only
 *  constant that changes off-road, and it alone caps you around 77 km/h out
 *  there — punishing enough to be worth avoiding, not so punishing that a
 *  mistake ends the run. */
const OFFROAD_ROLL = 7

/** Top speed used for the gauges and for scaling the visuals. */
const TOP_SPEED = 64

/** Road half-widths per second at full lock, and the speed at which you have
 *  full steering authority. Below it the wheel does progressively less, which
 *  is why you cannot pirouette a stationary car. */
const STEER_RATE = 1.7
const STEER_AUTHORITY_AT = 12

/**
 * How hard a bend throws you at the outside of the road. This is the game, and
 * it is the one number that decides whether the game is any fun.
 *
 * It has to stay well under `STEER_RATE`. At parity, holding the tightest bend
 * at top speed needs full lock, which means no margin to correct with and a car
 * that wanders into the dirt on its own — the difficulty stops being "how fast
 * dare you take this bend" and becomes "you cannot drive straight". At roughly
 * a third, the tightest bend at top speed asks for about a third of the wheel
 * and the rest is yours.
 */
const CENTRIFUGAL = 0.62

/** Steering grip left once the handbrake is on. */
const HANDBRAKE_GRIP = 0.45

/** How far off the road you can get before the barrier, in road half-widths.
 *  1.0 is the kerb, so there is a road's width of dirt to make a mistake in. */
const VERGE = 2.3

/** How fast the barrier scrubs speed off, per second, while you are pinned
 *  against it. Expressed as a rate and applied through `exp(-rate * dt)`, not
 *  as a per-frame multiplier — a per-frame constant would punish a 144Hz
 *  monitor two and a half times harder than a 60Hz one for the same mistake. */
const SCRAPE_RATE = 1.6

/** Lower bound of each gear, m/s. Cosmetic — there is no gearbox in the model. */
const GEARS = [0, 13, 25, 37, 49, 62]

/** Frames are integrated at most this far — a backgrounded tab must not teleport. */
const MAX_STEP = 1 / 20

/** Seconds a change of theme takes to cross over. */
const THEME_FADE = 2.4

/** How often to re-check the clock, so evening arrives on its own mid-drive. */
const CLOCK_TICK_MS = 30000

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

/** Frame-rate independent lerp: the fraction of the way to close in `dt` seconds. */
const ease = (rate, dt) => 1 - Math.exp(-rate * dt)

/**
 * An infinite driving game with the music playing behind it.
 *
 * WHAT THE MUSIC DOES AND DOES NOT DO
 * You drive the car. The music does not move it — pausing the track no longer
 * stops the world, because a game that plays itself is not a game. What the
 * audio still does is push: the engine makes a little more power on a loud
 * passage, and the landscape pulses on the beat. See `useAudioEnergy` for why
 * that envelope is derived rather than measured.
 *
 * HOW STATE GETS INTO THE LOOP
 * It does not, directly. React owns the props; the render loop owns `worldRef`,
 * a plain mutable object that effects write into and `requestAnimationFrame`
 * reads out of. The loop starts once and never restarts, so no prop change can
 * tear down the animation mid-corner, and no frame of the game re-renders the
 * tree. The HUD numbers are written straight to the DOM for the same reason.
 *
 * @param {object}  props
 * @param {object}  props.track   your current track — only `id` is used, to
 *                                seed the simulated tempo
 * @param {boolean} props.playing your audio state, for the engine's boost
 * @param {number}  props.time    your player clock, in seconds
 * @param {object}  [props.mediaRef] a same-origin media element, if you have one
 */
export default function CarGame({ track, playing = false, time = 0, mediaRef = null }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  // Written to directly by the loop. None of these cause a React render.
  const speedRef = useRef(null)
  const gearRef = useRef(null)
  const needleRef = useRef(null)
  const arcRef = useRef(null)
  const tripRef = useRef(null)
  const throttleBarRef = useRef(null)
  const brakeBarRef = useRef(null)
  const warnRef = useRef(null)
  const bestRef = useRef(null)

  const [biome, setBiome] = useState({ name: THEMES[0].name, plate: THEMES[0].plate })
  const [showHelp, setShowHelp] = useState(true)

  /**
   * `null` follows the clock; a theme id pins one.
   *
   * The override exists because the automatic behaviour is otherwise
   * unverifiable: at two in the afternoon there is no way to see the other two
   * worlds, including for whoever is working on them.
   */
  const [pinned, setPinned] = useState(null)

  const { read } = useAudioEnergy({ playing, time, trackId: track?.id, mediaRef })
  const { sample } = useDriveControls()

  const worldRef = useRef({
    travel: 0,
    speed: 0,
    speedRatio: 0,
    playerX: 0,
    tilt: 0,
    brake: 0,
    offroad: 0,
    elapsed: 0,
    dt: 0,
    energy: 0,
    kick: 0,
    reduced: false,
    carX: 0,
    carY: 0,
    carW: 0,
    best: 0,
    // Indices into THEMES, plus how far through the crossfade between them.
    themeFrom: 0,
    themeTo: 0,
    themeBlend: 1,
    biomePlate: THEMES[0].plate,
    biomeName: THEMES[0].name,
    accent: [16, 176, 178],
  })

  const readRef = useRef(read)
  readRef.current = read
  const sampleRef = useRef(sample)
  sampleRef.current = sample
  const playingRef = useRef(playing)
  playingRef.current = playing

  // The legend is for the first few seconds only; after that it is clutter.
  useEffect(() => {
    const id = setTimeout(() => setShowHelp(false), 7000)
    return () => clearTimeout(id)
  }, [])

  /* ── which world, by the clock ─────────────────────────────────────────────
     `new Date()` is read in an effect and never during render. The server and
     the browser are not in the same time zone, so asking what hour it is during
     render is a hydration mismatch dressed up as a sunset. */
  useEffect(() => {
    const world = worldRef.current

    const resolve = () => {
      const wanted =
        pinned === null
          ? themeForHour(new Date().getHours())
          : Math.max(0, THEMES.findIndex((t) => t.id === pinned))
      if (wanted === world.themeTo) return
      // Start the crossfade from wherever the last one got to, so changing
      // twice quickly does not snap back to the beginning.
      world.themeFrom = world.themeBlend < 0.5 ? world.themeFrom : world.themeTo
      world.themeTo = wanted
      world.themeBlend = 0
    }

    resolve()
    const id = setInterval(resolve, CLOCK_TICK_MS)
    return () => clearInterval(id)
  }, [pinned])

  /* ── canvas sizing ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined

    const resize = () => {
      // Capped at 2: a 3x phone screen triples the fill cost for a difference
      // nobody can see on a scanline renderer.
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.max(1, wrap.clientWidth)
      const h = Math.max(1, wrap.clientHeight)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d', { alpha: false })
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  /* ── the game loop ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return undefined
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return undefined

    const scene = createScene()
    const world = worldRef.current

    // Reduced motion is honoured as *less intensity*, not as a dead screen: the
    // camera shake and the strobing stop, the car stops bucking. It is still a
    // game and you still drive it.
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotion = () => {
      world.reduced = motionQuery.matches
    }
    applyMotion()
    motionQuery.addEventListener('change', applyMotion)

    let frame = 0
    let last = performance.now()
    let hudAt = 0
    let dustAt = 0
    let lastPlate = ''

    const tick = (now) => {
      frame = requestAnimationFrame(tick)

      const dt = Math.min(MAX_STEP, Math.max(0, (now - last) / 1000))
      last = now
      if (dt === 0) return

      const input = sampleRef.current(dt)
      const audio = readRef.current(now, dt)
      world.dt = dt
      world.elapsed += dt
      world.energy = audio.energy
      world.kick = audio.kick
      if (world.themeBlend < 1) world.themeBlend = Math.min(1, world.themeBlend + dt / THEME_FADE)

      /* ── surface ────────────────────────────────────────────────────────
         The kerb is at ±1. Past it you are in the dirt, and the transition is
         smoothed only for the visuals — the physics below reads the same value,
         so the grip comes back as gradually as it went away. */
      const onDirt = Math.abs(world.playerX) > 1 ? 1 : 0
      world.offroad += (onDirt - world.offroad) * ease(14, dt)

      /* ── speed ──────────────────────────────────────────────────────────
         Sum of forces, integrated. Nothing here eases toward a target speed. */
      const boost = playingRef.current ? 1 + audio.energy * 0.18 : 1
      const engine = THROTTLE_FORCE * input.throttle * boost
      const brakes = BRAKE_FORCE * input.brake + (input.handbrake ? HANDBRAKE_FORCE : 0)
      const drag = DRAG_K * world.speed * world.speed
      const roll = ROLL_K * (1 + world.offroad * (OFFROAD_ROLL - 1)) * world.speed

      world.speed = Math.max(0, world.speed + (engine - drag - roll - brakes) * dt)
      world.speedRatio = clamp(world.speed / TOP_SPEED, 0, 1)
      world.travel += world.speed * dt
      if (world.travel > world.best) world.best = world.travel

      /* ── steering ────────────────────────────────────────────────────────
         Authority scales with speed, so the wheel does nothing at a standstill
         and everything at pace. The handbrake takes most of the grip away,
         which is what makes it a handbrake rather than a second brake pedal. */
      const grip = input.handbrake ? HANDBRAKE_GRIP : 1
      const authority = clamp(world.speed / STEER_AUTHORITY_AT, 0, 1)
      world.playerX += input.steer * STEER_RATE * authority * grip * dt

      // The bend throws you at the outside of the corner, hard, and with the
      // square of speed. This is the whole difficulty curve: at 80 km/h the
      // bends are scenery, at 200 they are the thing trying to put you in the
      // dirt.
      world.playerX -= curveAt(world.travel) * CENTRIFUGAL * world.speedRatio ** 2 * dt

      // The barrier at the edge of the verge. Scraping it bleeds speed every
      // frame you stay against it rather than stopping you dead.
      if (Math.abs(world.playerX) > VERGE) {
        world.playerX = Math.sign(world.playerX) * VERGE
        world.speed *= Math.exp(-SCRAPE_RATE * dt)
      }

      world.tilt += (input.steer * 0.8 * authority * grip - world.tilt) * ease(9, dt)
      world.brake = clamp(input.brake + (input.handbrake ? 1 : 0), 0, 1)

      /* ── dust ───────────────────────────────────────────────────────────
         Thrown from the contact patches the renderer reported last frame, and
         rate-limited rather than spawned per frame — at 120 particles a second
         the pool wraps before the oldest has faded and the plume flickers. */
      if (world.offroad > 0.25 && world.speed > 5 && world.carW > 0 && now - dustAt > 38) {
        dustAt = now
        const wheelY = world.carY + world.carW * 0.1
        const spread = world.carW * 0.34
        kickDust(scene, world.carX - world.carW * 0.5, wheelY, world.speedRatio, spread)
        kickDust(scene, world.carX + world.carW * 0.5, wheelY, world.speedRatio, spread)
      }

      drawScene(ctx, scene, { w: wrap.clientWidth, h: wrap.clientHeight }, world)

      /* ── HUD, about twelve times a second ───────────────────────────────
         Straight to the DOM. Routing a speedometer through React state would
         re-render the whole overlay sixty times a second. */
      if (now - hudAt > 80) {
        hudAt = now
        const kph = Math.round(world.speed * 3.6)
        const sweep = clamp(world.speed / TOP_SPEED, 0, 1)

        if (speedRef.current) speedRef.current.textContent = String(kph)
        if (gearRef.current) {
          let gear = 1
          for (let i = 0; i < GEARS.length; i += 1) if (world.speed >= GEARS[i]) gear = i + 1
          gearRef.current.textContent = world.speed < 0.5 ? 'N' : String(gear)
        }
        if (needleRef.current) {
          needleRef.current.style.transform = `rotate(${-118 + sweep * 236}deg)`
        }
        if (arcRef.current) {
          // 173 is the arc's length: 236° of a circle of radius 42.
          arcRef.current.setAttribute('stroke-dasharray', `${(173 * sweep).toFixed(1)} 264`)
        }
        if (tripRef.current) tripRef.current.textContent = (world.travel / 1000).toFixed(2)
        if (bestRef.current) bestRef.current.textContent = String(Math.round(kph))
        if (throttleBarRef.current) {
          throttleBarRef.current.style.transform = `scaleY(${input.throttle.toFixed(2)})`
        }
        if (brakeBarRef.current) {
          brakeBarRef.current.style.transform = `scaleY(${world.brake.toFixed(2)})`
        }
        if (warnRef.current) {
          warnRef.current.style.opacity = world.offroad > 0.4 ? '1' : '0'
        }

        const [r, g, b] = world.accent
        wrap.style.setProperty('--drive', `${r | 0} ${g | 0} ${b | 0}`)

        // The one thing the HUD needs React for, and it changes twice a minute.
        if (world.biomePlate !== lastPlate) {
          lastPlate = world.biomePlate
          setBiome({ name: world.biomeName, plate: world.biomePlate })
        }
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      motionQuery.removeEventListener('change', applyMotion)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative size-full overflow-hidden bg-black select-none"
      style={{ '--drive': '255 96 176' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" aria-hidden="true" />

      {/* ── where you are ────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 sm:top-6 sm:left-6">
        <div className="flex items-center gap-2">
          {/* Clicking cycles auto → day → dusk → night → auto. The world you get
              follows your clock unless you say otherwise. */}
          <button
            type="button"
            onClick={() => {
              const order = [null, ...THEMES.map((t) => t.id)]
              setPinned(order[(order.indexOf(pinned) + 1) % order.length])
            }}
            title={pinned ? `Pinned to ${pinned}. Click to cycle.` : 'Following your local time. Click to pin a look.'}
            className="cursor-pointer rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-[rgb(var(--drive))] uppercase backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            {biome.plate}
            <span className="ml-1.5 text-white/35">{pinned ? 'pinned' : 'auto'}</span>
          </button>
          <span className="pointer-events-none font-mono text-[10px] tracking-wide text-white/55">
            {biome.name}
          </span>
        </div>
        <p className="pointer-events-none w-fit rounded-md bg-black/45 px-2 py-1 font-mono text-[11px] text-white/55 backdrop-blur-sm">
          <span ref={tripRef} className="tabular-nums text-white">
            0.00
          </span>{' '}
          km driven
        </p>
      </div>

      {/* ── off the tarmac ───────────────────────────────────────────────── */}
      <div
        ref={warnRef}
        className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center opacity-0 transition-opacity duration-200"
      >
        {/* Opaque, not a tint. This lands over whatever the sky happens to be
            doing — a low sun, a bright horizon — and a translucent red chip
            disappears completely against half of them. */}
        <span className="animate-pulse rounded-md bg-[#2a0708] px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.22em] text-red-300 uppercase shadow-[0_0_24px_-4px_rgb(248_113_113/0.7)] ring-1 ring-red-500/70 motion-reduce:animate-none">
          Off road — slowing
        </span>
      </div>

      {/* ── controls, for the first few seconds ──────────────────────────── */}
      <div
        className={[
          'pointer-events-none absolute bottom-6 left-4 transition-opacity duration-700 sm:left-6',
          showHelp ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <div className="flex flex-col gap-1.5 rounded-xl bg-black/50 p-3 backdrop-blur-sm">
          <Legend keys={['W', '↑']} label="Accelerate" />
          <Legend keys={['S', '↓']} label="Brake" />
          <Legend keys={['A', 'D']} label="Steer" />
          <Legend keys={['Space']} label="Handbrake" />
        </div>
      </div>

      {/* ── the instruments ──────────────────────────────────────────────── */}
      {/* The whole cluster sits on its own scrim. The instruments are white on
          nothing, which is fine over night tarmac and completely illegible over
          midday sand — and the theme changes underneath them by the hour. */}
      <div className="pointer-events-none absolute right-4 bottom-4 flex items-end gap-3 rounded-2xl bg-black/35 px-3 py-2 backdrop-blur-[2px] sm:right-6 sm:bottom-6">
        {/* Pedals. The bars scale from the bottom, like travel on a pedal box. */}
        <div className="flex h-[86px] items-end gap-1.5">
          <Pedal barRef={throttleBarRef} label="THR" tone="bg-[rgb(var(--drive))]" />
          <Pedal barRef={brakeBarRef} label="BRK" tone="bg-red-400" />
        </div>

        <div className="relative size-[124px]">
          {/* An SVG circle's dash pattern starts at 3 o'clock, so the dial is
              rotated back by 90° to start at the top and another 118° to put
              the sweep's midpoint there — the same range the needle uses. */}
          <svg viewBox="0 0 100 100" className="size-full" style={{ transform: 'rotate(-208deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgb(255 255 255 / 0.13)"
              strokeWidth="5"
              strokeDasharray="173 264"
              strokeLinecap="round"
            />
            <circle
              ref={arcRef}
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgb(var(--drive))"
              strokeWidth="5"
              strokeDasharray="0 264"
              strokeLinecap="round"
              className="opacity-80"
            />
          </svg>
          <div
            ref={needleRef}
            className="absolute inset-0 origin-center transition-transform duration-100 ease-out"
            style={{ transform: 'rotate(-118deg)' }}
          >
            <span className="absolute top-[13%] left-1/2 h-[24%] w-[2px] -translate-x-1/2 rounded-full bg-[rgb(var(--drive))]" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span
              ref={speedRef}
              className="font-mono text-[30px] leading-none font-semibold tabular-nums text-white"
            >
              0
            </span>
            <span className="font-mono text-[8px] tracking-[0.2em] text-white/40">KM/H</span>
            <span className="mt-1 grid size-6 place-items-center rounded-md bg-white/10 font-mono text-[11px] font-semibold text-white/80">
              <span ref={gearRef}>N</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ keys, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="grid h-5 min-w-5 place-items-center rounded border border-white/15 bg-white/10 px-1 font-mono text-[10px] text-white/80"
          >
            {k}
          </kbd>
        ))}
      </span>
      <span className="font-mono text-[10px] text-white/45">{label}</span>
    </div>
  )
}

function Pedal({ barRef, label, tone }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[68px] w-[9px] overflow-hidden rounded-full bg-white/20">
        <div
          ref={barRef}
          className={`absolute inset-x-0 bottom-0 h-full origin-bottom rounded-full ${tone}`}
          style={{ transform: 'scaleY(0)' }}
        />
      </div>
      <span className="font-mono text-[8px] tracking-widest text-white/55">{label}</span>
    </div>
  )
}
