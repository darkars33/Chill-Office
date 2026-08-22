'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import PersonCard from '@/components/office/PersonCard'
import { BUBBLE_TTL, JUST_JOINED_MS } from '@/lib/presence'
import {
  BACK,
  FRONT,
  HAZE_BACK,
  HAZE_FRONT,
  SCALE_BACK,
  SCALE_FRONT,
  fitFor,
  lerp,
} from '@/lib/floor-space'

/** Somebody's current state, in the words the office uses for it. */
function statusOf(person, now) {
  if (person.away) return { label: 'Away', tone: 'away' }
  if (now - person.joinedAt < JUST_JOINED_MS) return { label: 'Just joined', tone: 'new' }
  if (now - person.lastSpokeAt < BUBBLE_TTL) return { label: 'Chatting', tone: 'talk' }
  return { label: 'Listening', tone: 'here' }
}

/**
 * The floor of the room, with people standing on it.
 *
 * This is the piece that has to sell the whole metaphor, so it is built like a
 * stage rather than like a list:
 *
 *  · Every person has an `(x, depth)` spot. Depth drives their vertical
 *    position, their scale, their opacity *and* their paint order, so somebody
 *    at the back is smaller, hazier and behind the furniture. That one variable
 *    doing four jobs at once is what makes a flat div read as a room.
 *
 *  · Positions ease rather than jump. When the presence layer moves somebody,
 *    they walk — a single rAF loop interpolates every figure toward its target,
 *    which is far cheaper than one spring per person and reads as a room where
 *    people wander instead of teleport.
 *
 *  · Nobody stands in the middle. The station is there, and the crowd gathers
 *    around it.
 */
/**
 * @param {number} [props.limit] how many figures to actually draw. A phone has
 *   a tenth of the floor area a desktop has; drawing the same crowd on it does
 *   not read as "busy", it reads as a wall of overlapping name plates.
 */
export default function Floor({ people, messages, onWhisper, limit, className = '' }) {
  const drawn = limit ? people.slice(0, limit) : people

  const hostRef = useRef(null)
  const marks = useRef(new Map())
  const [held, setHeld] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  // Statuses are time-based, so the floor needs its own slow clock; nothing
  // else would re-render it when somebody stops being new.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 2000)
    return () => clearInterval(id)
  }, [])

  // Fold the latest targets in without disturbing anybody mid-walk.
  for (const person of drawn) {
    const mark = marks.current.get(person.id) ?? {
      x: person.spot.x,
      depth: person.spot.depth,
      element: null,
    }
    mark.target = person.spot
    marks.current.set(person.id, mark)
  }
  for (const id of marks.current.keys()) {
    if (!drawn.some((p) => p.id === id)) marks.current.delete(id)
  }

  useEffect(() => {
    let raf = 0

    const frame = () => {
      const host = hostRef.current
      if (host) {
        const w = host.clientWidth
        const h = host.clientHeight
        const fit = fitFor(h)

        for (const mark of marks.current.values()) {
          if (!mark.element || !mark.target) continue
          // Slow enough to read as walking rather than sliding.
          mark.x += (mark.target.x - mark.x) * 0.012
          mark.depth += (mark.target.depth - mark.depth) * 0.012

          const scale = lerp(SCALE_BACK, SCALE_FRONT, mark.depth) * fit
          const px = mark.x * w
          const py = lerp(BACK, FRONT, mark.depth) * h

          mark.element.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
          mark.element.style.zIndex = String(10 + Math.round(mark.depth * 60))
          // Haze: the far end of the room is further away through more air.
          mark.element.style.opacity = lerp(HAZE_BACK, HAZE_FRONT, mark.depth).toFixed(2)
        }
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Let go of somebody who leaves while you are looking at them.
  useEffect(() => {
    if (held && !drawn.some((p) => p.id === held)) setHeld(null)
  }, [held, drawn])

  /** The most recent thing each person said, while it is still fresh. */
  const bubbles = new Map()
  for (const message of messages) {
    if (now - message.at < BUBBLE_TTL) bubbles.set(message.authorId, message)
  }

  return (
    <div ref={hostRef} className={`absolute inset-0 ${className}`}>
      <AnimatePresence>
        {drawn.map((person) => {
          const status = statusOf(person, now)
          return (
            <motion.div
              key={person.id}
              ref={(el) => {
                const mark = marks.current.get(person.id)
                if (mark) mark.element = el
              }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ '--hue': `calc(var(--room-hue) + ${person.tint})` }}
              // Arriving and leaving are the two moments that carry meaning, so
              // they are the only two Framer handles here.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <Figure
                person={person}
                status={status}
                bubble={bubbles.get(person.id)}
                held={held === person.id}
                dimmed={held !== null && held !== person.id}
                onHold={() => setHeld(person.id)}
                onRelease={() => setHeld((c) => (c === person.id ? null : c))}
                onWhisper={() => {
                  onWhisper(person.id)
                  setHeld(null)
                }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

const TONE = {
  here: 'text-present',
  talk: 'text-[oklch(0.84_0.075_var(--hue))]',
  new: 'text-[oklch(0.84_0.075_var(--hue))]',
  away: 'text-away',
}

function Figure({ person, status, bubble, held, dimmed, onHold, onRelease, onWhisper }) {
  return (
    <motion.div
      className="-translate-x-1/2 -translate-y-full"
      animate={{ opacity: dimmed ? 0.35 : 1 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        className="group relative block cursor-pointer border-0 bg-transparent p-0"
        onPointerEnter={onHold}
        onPointerLeave={onRelease}
        onFocus={onHold}
        onBlur={onRelease}
        onClick={onHold}
        aria-label={`${person.handle}, ${status.label.toLowerCase()}. Open a whisper.`}
      >
        {/* What they just said, floating over their head — people talking
            across the room, rather than a chat log that happens to be nearby. */}
        <AnimatePresence>
          {bubble && !held ? (
            <motion.span
              className="panel-float absolute bottom-[calc(100%+34px)] left-1/2 z-30 w-max max-w-[190px] -translate-x-1/2 rounded-xl rounded-bl-sm px-2.5 py-1.5 text-left text-[11.5px] leading-snug text-paper/90"
              initial={{ opacity: 0, y: 6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              {bubble.text}
            </motion.span>
          ) : null}
        </AnimatePresence>

        {/* The contact shadow. Without it the figure floats and the room dies. */}
        <span
          className="absolute bottom-[-4px] left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-[50%] bg-void/75 blur-[4px]"
          aria-hidden="true"
        />

        <motion.span
          className="relative block text-[oklch(0.56_0.045_var(--hue))]"
          animate={{ y: held ? -3 : 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          <span
            className="block animate-idle motion-reduce:animate-none"
            style={{
              animationDuration: `${person.idle.duration}s`,
              animationDelay: `${person.idle.delay}s`,
            }}
          >
            <Persona seed={person.seed} seated={person.seated} away={person.away} className="h-[68px]" />
          </span>
        </motion.span>

        {/* Name plate. Always on, because knowing who is in the room without
            having to hunt for it is most of the point. */}
        <span className="mt-1 flex flex-col items-center gap-0.5">
          <span className="flex items-center gap-1">
            <span
              className={`size-1 rounded-full ${person.away ? 'bg-away' : 'bg-present'}`}
              aria-hidden="true"
            />
            <span className="font-mono text-[10.5px] whitespace-nowrap text-paper/85">
              {person.handle}
            </span>
          </span>
          <span
            className={`plate text-[8px] tracking-[0.12em] whitespace-nowrap ${TONE[status.tone]} opacity-80`}
          >
            {status.label}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {held ? <PersonCard person={person} status={status} onWhisper={onWhisper} /> : null}
      </AnimatePresence>
    </motion.div>
  )
}
