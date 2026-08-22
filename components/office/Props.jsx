import { place } from '@/lib/floor-space'

/**
 * The furniture.
 *
 * An office with nothing in it but people is a waiting room. These are the
 * things that make the floor read as somewhere with a purpose — a couch at the
 * front, desks along the back wall, a plant in the corner — and because they
 * are placed in the same depth space as the people, somebody can walk in front
 * of the couch and behind the plant without either of them knowing about it.
 *
 * All of it is flat SVG in one colour, deliberately. The furniture is scenery;
 * the moment it competes with the people for attention it has failed.
 */

/** Fixed positions. Hand-placed rather than generated: a room is arranged. */
const LAYOUT = [
  { id: 'desk-l', kind: 'desk', x: 0.14, depth: 0.06 },
  { id: 'desk-r', kind: 'desk', x: 0.86, depth: 0.06 },
  { id: 'plant-l', kind: 'plant', x: 0.05, depth: 0.34 },
  { id: 'shelf', kind: 'shelf', x: 0.5, depth: 0.02 },
  { id: 'couch', kind: 'couch', x: 0.26, depth: 0.88 },
  { id: 'table', kind: 'table', x: 0.47, depth: 0.93 },
  { id: 'plant-r', kind: 'plant', x: 0.95, depth: 0.62 },
]

export default function Props() {
  return (
    <>
      {LAYOUT.map((item) => {
        const at = place(item.depth)
        return (
          <div
            key={item.id}
            className="pointer-events-none absolute"
            style={{
              left: `${item.x * 100}%`,
              top: `${at.top * 100}%`,
              transform: `translate(-50%, -100%) scale(calc(${at.scale} * var(--fit, 1)))`,
              opacity: at.opacity * 0.9,
              zIndex: at.z,
            }}
            aria-hidden="true"
          >
            <Piece kind={item.kind} />
          </div>
        )
      })}
    </>
  )
}

function Piece({ kind }) {
  const skin = 'text-[oklch(0.34_0.028_var(--hue))]'

  if (kind === 'couch') {
    return (
      <svg viewBox="0 0 150 62" className={`h-[62px] w-auto ${skin}`} fill="currentColor">
        <rect x="6" y="20" width="138" height="26" rx="7" />
        <rect x="0" y="14" width="20" height="34" rx="7" />
        <rect x="130" y="14" width="20" height="34" rx="7" />
        <rect x="16" y="8" width="118" height="20" rx="6" opacity="0.82" />
        <rect x="18" y="46" width="8" height="10" rx="3" opacity="0.7" />
        <rect x="124" y="46" width="8" height="10" rx="3" opacity="0.7" />
        <ellipse cx="75" cy="60" rx="76" ry="4" className="fill-void/60" />
      </svg>
    )
  }

  if (kind === 'desk') {
    return (
      <svg viewBox="0 0 118 66" className={`h-[66px] w-auto ${skin}`} fill="currentColor">
        {/* monitor */}
        <rect x="34" y="2" width="50" height="30" rx="3" opacity="0.9" />
        <rect x="39" y="7" width="40" height="20" rx="2" className="fill-[oklch(0.5_0.06_var(--hue))]" opacity="0.5" />
        <rect x="55" y="32" width="8" height="6" />
        <rect x="47" y="38" width="24" height="3" rx="1.5" />
        {/* top and legs */}
        <rect x="4" y="41" width="110" height="6" rx="3" />
        <rect x="12" y="47" width="5" height="16" rx="2" opacity="0.85" />
        <rect x="101" y="47" width="5" height="16" rx="2" opacity="0.85" />
        <ellipse cx="59" cy="64" rx="56" ry="3" className="fill-void/55" />
      </svg>
    )
  }

  if (kind === 'plant') {
    return (
      <svg viewBox="0 0 56 96" className={`h-[96px] w-auto ${skin}`} fill="currentColor">
        <path d="M28 62c-2-16-10-26-22-30 12-2 20 4 24 14-1-14 3-24 12-32-4 12-4 22 0 30 4-8 10-12 18-12-8 6-12 14-12 24" opacity="0.92" />
        <path d="M15 66h26l-4 24H19l-4-24z" />
        <ellipse cx="28" cy="93" rx="18" ry="3" className="fill-void/55" />
      </svg>
    )
  }

  if (kind === 'shelf') {
    return (
      <svg viewBox="0 0 210 40" className={`h-[40px] w-auto ${skin}`} fill="currentColor">
        <rect x="0" y="30" width="210" height="5" rx="2" />
        <g opacity="0.85">
          <rect x="14" y="12" width="6" height="18" rx="1" />
          <rect x="23" y="8" width="5" height="22" rx="1" />
          <rect x="31" y="14" width="7" height="16" rx="1" />
          <rect x="150" y="10" width="6" height="20" rx="1" />
          <rect x="159" y="15" width="5" height="15" rx="1" />
          <rect x="167" y="7" width="7" height="23" rx="1" />
        </g>
        <rect x="92" y="16" width="26" height="14" rx="2" opacity="0.7" />
      </svg>
    )
  }

  // table
  return (
    <svg viewBox="0 0 74 40" className={`h-[40px] w-auto ${skin}`} fill="currentColor">
      <ellipse cx="37" cy="14" rx="34" ry="7" />
      <rect x="34" y="16" width="6" height="18" rx="2" opacity="0.85" />
      <ellipse cx="37" cy="35" rx="16" ry="3.5" opacity="0.85" />
      <rect x="20" y="6" width="8" height="9" rx="2" className="fill-[oklch(0.6_0.07_var(--hue))]" opacity="0.75" />
      <ellipse cx="37" cy="38" rx="30" ry="3" className="fill-void/55" />
    </svg>
  )
}
