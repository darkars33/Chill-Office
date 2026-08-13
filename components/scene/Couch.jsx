// The couch, seen from behind. Must paint after <Colleagues /> so the backrest
// crops them at the shoulders.
export default function Couch() {
  return (
    <g>
      {/* back cushion */}
      <rect x="536" y="586" width="536" height="132" rx="26" fill="url(#couch)" />
      {/* lit top edge — the one thing that separates the couch from the floor */}
      <rect x="540" y="586" width="528" height="8" rx="4" fill="#ffbb85" opacity="0.5" />
      {/* seam between the two back cushions */}
      <path d="M804 598v114" stroke="#170d11" strokeWidth="5" opacity="0.75" />
      {/* where the backrest meets the seat */}
      <path d="M548 706h512" stroke="#170d11" strokeWidth="4" opacity="0.55" />
      {/* armrests, a touch lighter so the ends of the couch read */}
      <rect x="496" y="602" width="56" height="134" rx="26" fill="#4a2b32" />
      <rect x="1056" y="602" width="56" height="134" rx="26" fill="#4a2b32" />
      <rect x="500" y="602" width="48" height="7" rx="3.5" fill="#ffbb85" opacity="0.38" />
      <rect x="1060" y="602" width="48" height="7" rx="3.5" fill="#ffbb85" opacity="0.38" />
      {/* base + legs */}
      <rect x="516" y="710" width="576" height="34" rx="12" fill="#1e1216" />
      <rect x="556" y="744" width="16" height="26" rx="5" fill="#160d11" />
      <rect x="1036" y="744" width="16" height="26" rx="5" fill="#160d11" />
    </g>
  )
}
