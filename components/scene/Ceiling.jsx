import { PENDANT_LAMPS } from '@/lib/scene-geometry'

// Ceiling slab and the two pendant lamps swaying over it.
export default function Ceiling() {
  return (
    <>
      <rect x="0" y="0" width="1600" height="70" fill="#0d090f" />
      <rect x="0" y="66" width="1600" height="4" fill="#ffb877" opacity="0.18" />
      {PENDANT_LAMPS.map((lamp) => (
        <g key={lamp.x} className="pendant" style={{ transformOrigin: `${lamp.x}px 0px` }}>
          <line x1={lamp.x} y1="0" x2={lamp.x} y2={lamp.len} stroke="#3b2a2e" strokeWidth="3" />
          {/* shade */}
          <path
            d={`M${lamp.x - 34} ${lamp.len + 30} L${lamp.x - 13} ${lamp.len} L${lamp.x + 13} ${lamp.len} L${lamp.x + 34} ${lamp.len + 30} Z`}
            fill="#31212a"
          />
          <ellipse cx={lamp.x} cy={lamp.len + 30} rx="34" ry="6" fill="#ffdcab" opacity="0.9" />
          <circle cx={lamp.x} cy={lamp.len + 34} r="9" fill="#fff2d0" />
          <circle cx={lamp.x} cy={lamp.len + 40} r="76" fill="url(#lampGlow)" opacity="0.5" />
        </g>
      ))}
    </>
  )
}
