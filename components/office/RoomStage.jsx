'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Floor from '@/components/office/Floor'
import Props from '@/components/office/Props'
import { formatCount } from '@/lib/rooms'
import { fitFor } from '@/lib/floor-space'
import { thumbnailUrl } from '@/lib/utils/youtube'

/** Fine tooth over the whole room, so the flat fills read as material. */
const GRAIN =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'150\' height=\'150\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'

/**
 * The room itself: back wall, floor, the station in the middle of it, and
 * everybody standing around.
 *
 * The depth illusion is doing all the work here and it is built from three
 * cheap things stacked in order — a wall that is lighter where the lamp hits
 * it, a floor plane whose grid converges toward a horizon, and a contact shadow
 * under everything that stands on it. No 3D, no perspective transforms, no
 * canvas; just paint order and a scale ramp.
 *
 * The station deliberately sits at the *same* z-index the floor gives somebody
 * standing at mid-depth, so people nearer the camera walk in front of it. That
 * single overlap is what stops the album art reading as a UI card pinned over a
 * background.
 */
export default function RoomStage({
  area,
  track,
  playing,
  people,
  messages,
  reactions,
  total,
  peopleLimit,
  onWhisper,
}) {
  const stageRef = useRef(null)
  // Everything standing in the room is authored at one size and multiplied by
  // this, so a phone gets a small room rather than a cropped one.
  const [fit, setFit] = useState(1)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const measure = () => setFit(fitFor(stage.clientHeight))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={stageRef}
      className="relative size-full overflow-hidden rounded-2xl bg-wall"
      style={{ '--fit': fit }}
    >
      {/* ── the wall ───────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-[46%]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#1d1815,#171310)]" />
        {/* The pendant over the station, thrown against the wall behind it. */}
        <div className="absolute inset-0 animate-lamp bg-[radial-gradient(58%_120%_at_50%_-10%,oklch(0.62_0.075_var(--hue)/0.42),transparent_70%)] motion-reduce:animate-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,rgb(255_240_220/0.16),transparent)]" />

        {/* The door plate. Every room in an office has one. */}
        <div className="absolute top-3.5 left-4 flex items-center gap-2.5 lg:top-5 lg:left-6">
          <span className="inset grid size-7 place-items-center rounded-md">
            <span className="size-1.5 rounded-full bg-[oklch(0.8_0.09_var(--hue))]" />
          </span>
          <span>
            <span className="plate block text-[oklch(0.8_0.07_var(--hue))]">{area.plate}</span>
            <span className="mt-0.5 block font-mono text-[10px] text-pencil">
              {formatCount(total)} in the room
            </span>
          </span>
        </div>
      </div>

      {/* ── the floor ──────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-[46%] bottom-0">
        {/* Lightest right at the horizon and falling away toward the viewer —
            the opposite of the wall above it, which is what makes the seam
            between them read as a corner rather than as a colour change. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#3a2f26,#251e19_26%,#191412_70%,#121010)]" />
        {/* The baseboard. One 2px line doing a lot of work. */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(to_bottom,oklch(0.62_0.06_var(--hue)/0.5),transparent)]" />
        {/* Boards converging toward the horizon. The gradient mask fades them
            out before they reach the front edge, where they would look like a
            grid rather than like a floor. */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, rgb(255 240 220 / 0.05) 0 1px, transparent 1px 92px)',
            maskImage: 'linear-gradient(to bottom, rgb(0 0 0 / 0.9), transparent 72%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_86%_at_50%_0%,oklch(0.58_0.07_var(--hue)/0.3),transparent_72%)]" />
      </div>

      {/* ── what is in it ──────────────────────────────────────────────── */}
      <Props />

      <Station track={track} playing={playing} reactions={reactions} />

      {/* ── everybody in it ────────────────────────────────────────────── */}
      <Floor
        people={people}
        messages={messages}
        onWhisper={onWhisper}
        limit={peopleLimit}
        className="z-10"
      />

      {/* Depth haze at the back and a darkened front edge, so the room has air
          in it and does not end at a hard rectangle. */}
      <div className="pointer-events-none absolute inset-0 z-[80] bg-[radial-gradient(120%_100%_at_50%_38%,transparent_46%,rgb(13_11_10/0.62)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 z-[81] opacity-[0.05]"
        style={{ backgroundImage: GRAIN, backgroundSize: '150px 150px' }}
      />
    </div>
  )
}

/**
 * The music station: a record standing on a wooden plinth in the middle of the
 * floor, with a light over it.
 *
 * This is the "object inside the environment" the player is supposed to be —
 * it has a footprint, a shadow, and people walk in front of it.
 */
function Station({ track, playing, reactions }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 z-[38] -translate-x-1/2"
      style={{ top: '30%' }}
    >
      <div className="relative flex flex-col items-center">
        {/* The pendant lamp above it. */}
        <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
          style={{ top: 'calc(var(--fit) * -86px)' }}>
          <span
            className="w-px bg-[linear-gradient(to_bottom,transparent,rgb(255_240_220/0.22))]"
            style={{ height: 'calc(var(--fit) * 56px)' }}
          />
          <span className="h-3 w-9 rounded-b-full bg-[linear-gradient(to_bottom,#3a302a,#221c18)] shadow-[0_2px_6px_rgb(0_0_0/0.6)]" />
          <span className="mt-px size-1.5 rounded-full bg-[oklch(0.9_0.08_var(--hue))] shadow-[0_0_18px_6px_oklch(0.8_0.09_var(--hue)/0.55)]" />
        </div>

        {/* The record itself, leaning on the plinth. */}
        <div className="relative">
          <div className="lamplight relative overflow-hidden rounded-xl shadow-[0_18px_30px_-14px_rgb(0_0_0/0.9)]"
            style={{ width: 'calc(var(--fit) * 176px)', height: 'calc(var(--fit) * 176px)' }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={track.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.97, filter: 'blur(12px)' }}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              >
                {/* hqdefault is 480×360 with letterbox bars; 1.34 is exactly
                    the zoom that pushes them out of a square crop. */}
                <Image
                  src={thumbnailUrl(track.id)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 176px, 136px"
                  priority
                  draggable={false}
                  className="scale-[1.34] object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
            <span className="absolute inset-0 bg-[linear-gradient(165deg,rgb(255_240_220/0.12),transparent_38%,rgb(13_11_10/0.5))]" />
          </div>

          {/* The turntable disc peeking out behind the sleeve. */}
          <div
            className="absolute top-1/2 -right-[16%] -z-1 -translate-y-1/2 animate-record rounded-full bg-[repeating-radial-gradient(circle_at_center,#171310_0_2px,#0f0d0c_3px_5px)] shadow-[0_10px_20px_-10px_rgb(0_0_0/0.9)] motion-reduce:animate-none"
            style={{
              width: 'calc(var(--fit) * 140px)',
              height: 'calc(var(--fit) * 140px)',
              animationPlayState: playing ? 'running' : 'paused',
            }}
            aria-hidden="true"
          >
            <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.6_0.075_var(--hue))]" />
            <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-void" />
          </div>
        </div>

        {/* The plinth it all stands on. Given real height so the record reads
            as resting on furniture rather than hovering. */}
        <div
          className="timber -mt-2 rounded-md"
          style={{ width: 'calc(var(--fit) * 236px)', height: 'calc(var(--fit) * 36px)' }}
        />
        <div
          className="rounded-b-sm bg-void/55"
          style={{ width: 'calc(var(--fit) * 224px)', height: 'calc(var(--fit) * 6px)' }}
        />
        <div
          className="mt-0.5 rounded-[50%] bg-void/70 blur-[6px]"
          style={{ width: 'calc(var(--fit) * 268px)', height: 'calc(var(--fit) * 9px)' }}
        />

        {/* Reactions rising off the station. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <AnimatePresence>
            {reactions.map((reaction, i) => (
              <motion.span
                key={reaction.id}
                className="absolute top-8 left-1/2 text-xl"
                initial={{ opacity: 0, x: '-50%', y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: -120,
                  x: `${-50 + (i % 2 ? 1 : -1) * (22 + i * 10)}%`,
                  scale: [0.5, 1.1, 1, 0.9],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: 'easeOut' }}
              >
                {reaction.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
