import { range, rng } from '@/lib/seed'

/**
 * A person, drawn.
 *
 * Deliberately a silhouette and nothing more: a head, shoulders, and one or two
 * props. There is no face, no skin tone and no body type being asserted —
 * anonymity has to survive being *depicted*, and the moment you draw features
 * you have started describing somebody who did not consent to being described.
 *
 * What varies instead is posture and what they brought with them. Seeded, so
 * a given handle is always the same figure, and enough combinations that a
 * floor of twenty never repeats.
 */

/** Everything about how one person is drawn, derived from their seed. */
export function figureFor(seed) {
  const next = rng(seed ^ 0x4d21)
  return {
    build: range(next, 0, 2), // shoulder width and slope
    hair: range(next, 0, 3), // silhouette above the head
    headphones: next() < 0.62, // most people in here are wearing them
    prop: next() < 0.34 ? (next() < 0.5 ? 'mug' : 'laptop') : null,
    lean: +((next() - 0.5) * 5).toFixed(1), // a couple of degrees off vertical
  }
}

const SHOULDERS = [
  'M6 44c0-7.2 5-12 14-12s14 4.8 14 12v8H6v-8z',
  'M4 44c0-8 6-13 16-13s16 5 16 13v8H4v-8z',
  'M7 45c0-6.4 4.4-11.4 13-11.4S33 38.6 33 45v7H7v-7z',
]

/**
 * @param {object} props
 * @param {number} props.seed
 * @param {boolean} [props.seated]   sitting reads as working, standing as passing through
 * @param {boolean} [props.away]     drawn faded and without the headphone arc
 * @param {boolean} [props.speaking]
 * @param {string} [props.className]
 */
export default function Persona({ seed, seated = false, away = false, className = 'h-14' }) {
  const f = figureFor(seed)

  return (
    <svg
      viewBox="0 0 40 56"
      className={`${className} w-auto overflow-visible`}
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${f.lean}deg)`, transformOrigin: '50% 100%' }}
    >
      <g
        fill="currentColor"
        // Seated people sit lower and slightly wider — the same silhouette
        // pushed down into a chair.
        transform={seated ? 'translate(0 6) scale(1 0.9)' : undefined}
        opacity={away ? 0.42 : 1}
      >
        <path d={SHOULDERS[f.build]} />
        <circle cx="20" cy="21" r="10" />

        {f.hair === 1 ? <path d="M10 19a10 10 0 0120 0v-2a10 10 0 00-20 0v2z" /> : null}
        {f.hair === 2 ? <path d="M9.4 22c0-8 4.8-12 10.6-12s10.6 4 10.6 12c0-4-4.6-6-10.6-6s-10.6 2-10.6 6z" /> : null}
        {f.hair === 3 ? <ellipse cx="20" cy="12.6" rx="9.4" ry="5" /> : null}
      </g>

      {/* Headphones: the one prop nearly everyone here has. Drawn as an arc over
          the head plus two cups, in the room's accent rather than the body
          colour so it catches the light. */}
      {f.headphones && !away ? (
        <g
          fill="none"
          stroke="oklch(0.82 0.075 var(--hue))"
          strokeWidth="2.4"
          strokeLinecap="round"
          transform={seated ? 'translate(0 6) scale(1 0.9)' : undefined}
        >
          <path d="M9.6 21.5a10.4 10.4 0 0120.8 0" />
          <path d="M9.4 21.4v3.4M30.6 21.4v3.4" />
        </g>
      ) : null}

      {f.prop === 'mug' && !away ? (
        <g fill="oklch(0.78 0.07 var(--hue))" transform={seated ? 'translate(0 6)' : undefined}>
          <rect x="30" y="41" width="6.4" height="6" rx="1.4" />
          <path
            d="M36.8 42.4h1.2a1.6 1.6 0 010 3.2h-1.2z"
            fill="none"
            stroke="oklch(0.78 0.07 var(--hue))"
            strokeWidth="1.2"
          />
        </g>
      ) : null}

      {f.prop === 'laptop' && !away ? (
        <g fill="oklch(0.72 0.06 var(--hue))" transform={seated ? 'translate(0 6)' : undefined}>
          <path d="M9 44h22l3 7H6l3-7z" opacity="0.75" />
          <rect x="12" y="36" width="16" height="9" rx="1" opacity="0.55" />
        </g>
      ) : null}
    </svg>
  )
}
