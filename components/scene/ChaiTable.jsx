// `fill-box` grows each plume from its own base, i.e. the lip of the cup. Without
// it the origin falls at the centre of the whole 1600x900 viewBox, so `scaleY`
// swings the steam about y=450 — which lifts it off the cups and drags it
// downwards faster than translateY raises it.
const plume = [
  'origin-bottom [transform-box:fill-box] opacity-0',
  'animate-steam-rise motion-reduce:animate-none motion-reduce:opacity-30',
].join(' ')

// Side table: two kulhads of cutting chai, still steaming, and biscuits.
export default function ChaiTable() {
  return (
    <g>
      <rect x="1130" y="638" width="150" height="12" rx="5" fill="#5c3629" />
      <rect x="1142" y="650" width="9" height="92" fill="#3f2620" />
      <rect x="1259" y="650" width="9" height="92" fill="#3f2620" />

      {/* steam has to be drawn before the cups so it reads as behind them */}
      <g stroke="#ffd9ab" strokeWidth="3.4" fill="none" strokeLinecap="round">
        <path className={plume} d="M1172 616q-9-16 0-30t-3-28" />
        <path
          className={`${plume} [animation-duration:5.4s] [animation-delay:-2.2s]`}
          d="M1236 612q9-18 0-32t4-26"
        />
      </g>

      {/* kulhad-style cups */}
      <g fill="#c0703f">
        <path d="M1158 610h30l-4 26h-22z" />
        <path d="M1222 610h30l-4 26h-22z" />
      </g>
      <g fill="#e8985e">
        <rect x="1156" y="606" width="34" height="7" rx="3" />
        <rect x="1220" y="606" width="34" height="7" rx="3" />
      </g>
      {/* a plate of biscuits, obviously */}
      <ellipse cx="1204" cy="632" rx="26" ry="7" fill="#d9c6a8" opacity="0.55" />
    </g>
  )
}
