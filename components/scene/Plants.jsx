// Monstera on the left, rubber plant on the right. Both sway, out of phase.
export default function Plants() {
  return (
    <g>
      {/* left monstera, shifted clear of the desk */}
      <g transform="translate(74 0)">
        <g className="plant-sway" style={{ transformOrigin: '292px 660px' }}>
          <g fill="#22301f">
            <ellipse cx="256" cy="512" rx="42" ry="26" transform="rotate(-26 256 512)" />
            <ellipse cx="330" cy="496" rx="44" ry="27" transform="rotate(20 330 496)" />
            <ellipse cx="278" cy="452" rx="38" ry="24" transform="rotate(-8 278 452)" />
            <ellipse cx="344" cy="556" rx="40" ry="25" transform="rotate(34 344 556)" />
            <ellipse cx="240" cy="576" rx="36" ry="23" transform="rotate(-40 240 576)" />
          </g>
          <g stroke="#2c3d28" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M292 660q-14-70-34-142" />
            <path d="M292 660q10-72 36-158" />
            <path d="M292 660q-2-96-12-198" />
          </g>
        </g>
        <path d="M262 656h60l-8 56h-44z" fill="#5b3529" />
        <rect x="258" y="648" width="68" height="12" rx="5" fill="#6d4132" />
      </g>

      {/* right rubber plant */}
      <g className="plant-sway plant-sway-slow" style={{ transformOrigin: '1420px 664px' }}>
        <g fill="#1f2b1e">
          <ellipse cx="1392" cy="592" rx="30" ry="19" transform="rotate(-30 1392 592)" />
          <ellipse cx="1452" cy="580" rx="31" ry="19" transform="rotate(26 1452 580)" />
          <ellipse cx="1414" cy="546" rx="28" ry="18" transform="rotate(-12 1414 546)" />
        </g>
        <g stroke="#2a3826" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M1420 664q-10-46-26-76" />
          <path d="M1420 664q8-52 30-88" />
        </g>
      </g>
      <path d="M1394 660h54l-7 48h-40z" fill="#54312a" />
      <rect x="1390" y="652" width="62" height="11" rx="5" fill="#663d31" />
    </g>
  )
}
