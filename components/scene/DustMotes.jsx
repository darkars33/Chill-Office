import { MOTES } from '@/lib/scene-geometry'

// Dust drifting through the light. Painted last of the room contents so the
// motes float over everything.
export default function DustMotes() {
  return (
    <g fill="#ffe3ba">
      {MOTES.map((m, i) => (
        <circle
          key={i}
          className="animate-mote-float opacity-0 motion-reduce:animate-none motion-reduce:opacity-30"
          cx={m.x}
          cy={m.y}
          r={m.r}
          style={{
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.dur}s`,
            '--drift': `${m.drift}px`,
          }}
        />
      ))}
    </g>
  )
}
