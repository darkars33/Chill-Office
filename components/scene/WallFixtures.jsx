// Right of frame: the whiteboard with a sprint burndown going the wrong way,
// and the wall clock above it.
export default function WallFixtures() {
  return (
    <g>
      {/* whiteboard, pulled in from the edge to stay readable when cropped */}
      <g transform="translate(-62 0)">
        <rect x="1362" y="250" width="218" height="146" rx="8" fill="#241a20" />
        <rect x="1372" y="260" width="198" height="126" rx="4" fill="#3a2d33" />
        <g stroke="#ffbe8c" strokeWidth="3" opacity="0.4" fill="none" strokeLinecap="round">
          <path d="M1388 286h84" />
          <path d="M1388 302h132" />
          <path d="M1388 318h62" />
          {/* the sprint burndown, going the wrong way */}
          <path d="M1396 366l30-18 26 12 28-26 34 8" stroke="#ff9c7a" />
        </g>
      </g>
      {/* wall clock, above the board and clear of the window frame */}
      <circle cx="1372" cy="158" r="32" fill="#241a20" />
      <circle cx="1372" cy="158" r="25" fill="#3b2c31" />
      <g stroke="#ffd7a8" strokeWidth="3" strokeLinecap="round">
        <path d="M1372 158v-16" />
        <path d="M1372 158l12 8" />
      </g>
      <circle cx="1372" cy="158" r="2.6" fill="#ffd7a8" />
    </g>
  )
}
