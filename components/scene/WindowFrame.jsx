// The frame around the glass, plus the warm rim on every edge facing the sun.
export default function WindowFrame() {
  return (
    <>
      <g fill="#120c12">
        <rect x="306" y="84" width="1004" height="18" rx="6" />
        <rect x="306" y="542" width="1004" height="22" rx="6" />
        <rect x="306" y="84" width="20" height="480" rx="6" />
        <rect x="1290" y="84" width="20" height="480" rx="6" />
        {/* mullions */}
        <rect x="641" y="96" width="12" height="452" />
        <rect x="963" y="96" width="12" height="452" />
        <rect x="318" y="300" width="980" height="10" />
      </g>
      {/* warm rim on the frame edges facing the sun */}
      <g fill="#ffb877" opacity="0.5">
        <rect x="641" y="96" width="3" height="452" />
        <rect x="963" y="96" width="3" height="452" />
        <rect x="318" y="300" width="980" height="2.5" />
        <rect x="306" y="556" width="1004" height="3" rx="1.5" />
      </g>
      {/* sill */}
      <rect x="292" y="560" width="1032" height="14" rx="7" fill="#2a1c22" />
      <rect x="292" y="560" width="1032" height="3" rx="1.5" fill="#ffc48a" opacity="0.45" />
    </>
  )
}
