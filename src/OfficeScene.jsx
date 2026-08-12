// Hand-drawn office-at-golden-hour scene. Pure inline SVG so the app ships with
// zero image assets: two colleagues on a couch, sun going down over the city,
// chai steaming on the side table.
//
// Deterministic pseudo-random so the layout never shifts between renders.
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const MOTES = Array.from({ length: 26 }, (_, i) => ({
  x: 340 + rand(i + 1) * 940,
  y: 130 + rand(i + 51) * 400,
  r: 1.1 + rand(i + 101) * 2.4,
  delay: -(rand(i + 151) * 18).toFixed(2),
  dur: (11 + rand(i + 201) * 12).toFixed(2),
  drift: (rand(i + 251) * 60 - 30).toFixed(1),
}))

// Lit windows in the skyline towers.
const WINDOWS = Array.from({ length: 54 }, (_, i) => ({
  x: 330 + Math.floor(rand(i + 301) * 46) * 20,
  y: 330 + Math.floor(rand(i + 401) * 9) * 22,
  lit: rand(i + 501) > 0.34,
  delay: -(rand(i + 601) * 9).toFixed(2),
}))

export default function OfficeScene() {
  return (
    <svg
      className="scene"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241a3c" />
          <stop offset="0.28" stopColor="#5b2f4c" />
          <stop offset="0.52" stopColor="#a8464a" />
          <stop offset="0.72" stopColor="#dd7443" />
          <stop offset="0.88" stopColor="#f5a860" />
          <stop offset="1" stopColor="#ffd79b" />
        </linearGradient>

        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffcf8a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff9a52" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#150f16" />
          <stop offset="0.6" stopColor="#241922" />
          <stop offset="1" stopColor="#1a121a" />
        </linearGradient>

        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1d21" />
          <stop offset="1" stopColor="#0f0a0d" />
        </linearGradient>

        <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffce8f" stopOpacity="0.20" />
          <stop offset="1" stopColor="#ffb066" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="couch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5c363c" />
          <stop offset="1" stopColor="#2b1a20" />
        </linearGradient>

        <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1d33" />
          <stop offset="1" stopColor="#3d2436" />
        </linearGradient>

        <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffdba4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb066" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.72">
          <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#06040a" stopOpacity="0.82" />
        </radialGradient>

        <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="softenSm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>

        <clipPath id="windowClip">
          <rect x="318" y="96" width="980" height="452" rx="10" />
        </clipPath>
      </defs>

      {/* ---------- room shell ---------- */}
      <rect width="1600" height="900" fill="url(#wall)" />

      {/* ---------- the view out the window ---------- */}
      <g clipPath="url(#windowClip)">
        <rect x="318" y="96" width="980" height="452" fill="url(#sky)" />

        {/* low sun */}
        <circle cx="812" cy="470" r="210" fill="url(#sunGlow)" />
        <circle cx="812" cy="470" r="46" fill="#fff3cf" opacity="0.92" filter="url(#softenSm)" />

        {/* thin cloud bands */}
        <g fill="#ffd7a1" opacity="0.16">
          <rect x="318" y="250" width="980" height="9" rx="4.5" />
          <rect x="420" y="288" width="700" height="7" rx="3.5" />
          <rect x="318" y="322" width="980" height="6" rx="3" />
        </g>

        {/* skyline */}
        <g fill="url(#tower)">
          <rect x="330" y="352" width="86" height="200" />
          <rect x="424" y="316" width="64" height="236" />
          <rect x="496" y="386" width="74" height="166" />
          <rect x="578" y="336" width="58" height="216" />
          <rect x="644" y="400" width="92" height="152" />
          <rect x="744" y="368" width="56" height="184" />
          <rect x="808" y="344" width="78" height="208" />
          <rect x="894" y="404" width="66" height="148" />
          <rect x="968" y="330" width="70" height="222" />
          <rect x="1046" y="392" width="88" height="160" />
          <rect x="1142" y="356" width="60" height="196" />
          <rect x="1210" y="410" width="92" height="142" />
        </g>
        {/* rooftop water tanks + masts, the Mumbai giveaway */}
        <g fill="#2b1d33">
          <rect x="440" y="298" width="30" height="20" rx="4" />
          <rect x="452" y="276" width="4" height="24" />
          <rect x="828" y="326" width="34" height="20" rx="4" />
          <rect x="986" y="308" width="28" height="24" rx="4" />
          <rect x="998" y="286" width="4" height="24" />
        </g>

        {/* lit office windows across the way */}
        <g>
          {WINDOWS.map((w, i) => (
            <rect
              key={i}
              className={w.lit ? 'city-window is-lit' : 'city-window'}
              x={w.x}
              y={w.y}
              width="7"
              height="10"
              rx="1"
              fill="#ffcf8f"
              style={{ animationDelay: `${w.delay}s` }}
            />
          ))}
        </g>

        {/* haze over the city */}
        <rect x="318" y="430" width="980" height="118" fill="#ff9d5c" opacity="0.22" />

        {/* birds heading home */}
        <g className="birds" stroke="#3a2436" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M470 208l9-7 9 7" />
          <path d="M508 190l7-6 7 6" />
          <path d="M542 214l8-6 8 6" />
        </g>
      </g>

      {/* ---------- window frame ---------- */}
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

      {/* ---------- light spilling into the room ---------- */}
      <g opacity="0.85">
        <polygon points="330,566 640,566 520,900 60,900" fill="url(#shaft)" />
        <polygon points="670,566 950,566 1010,900 590,900" fill="url(#shaft)" />
        <polygon points="990,566 1290,566 1560,900 1120,900" fill="url(#shaft)" />
      </g>

      {/* ---------- ceiling + pendant lamps ---------- */}
      <rect x="0" y="0" width="1600" height="70" fill="#0d090f" />
      <rect x="0" y="66" width="1600" height="4" fill="#ffb877" opacity="0.18" />
      {[
        { x: 214, len: 168 },
        { x: 1392, len: 138 },
      ].map((lamp) => (
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

      {/* ---------- floor ---------- */}
      <rect x="0" y="662" width="1600" height="238" fill="url(#floor)" />
      <rect x="0" y="662" width="1600" height="3" fill="#ffb877" opacity="0.14" />

      {/* ---------- left: abandoned desk, monitor still on ---------- */}
      {/* nudged inwards so the screen survives the 16:9 side crop */}
      <g transform="translate(60 0)">
        <rect x="24" y="470" width="234" height="12" rx="5" fill="#2e2027" />
        <rect x="40" y="482" width="10" height="182" fill="#241a20" />
        <rect x="232" y="482" width="10" height="182" fill="#241a20" />
        {/* monitor */}
        <rect x="70" y="352" width="146" height="98" rx="7" fill="#180f16" />
        <rect x="78" y="360" width="130" height="82" rx="4" fill="#2b4a52" />
        <rect className="screen-glow" x="78" y="360" width="130" height="82" rx="4" fill="#6fd0d8" />
        {/* a few lines of code nobody will read till Monday */}
        <g fill="#0e1a1e" opacity="0.5">
          <rect x="86" y="370" width="62" height="4" rx="2" />
          <rect x="86" y="382" width="94" height="4" rx="2" />
          <rect x="94" y="394" width="74" height="4" rx="2" />
          <rect x="94" y="406" width="52" height="4" rx="2" />
          <rect x="86" y="418" width="84" height="4" rx="2" />
        </g>
        <rect className="cursor" x="152" y="406" width="7" height="4" rx="2" fill="#0e1a1e" />
        <rect x="132" y="450" width="22" height="18" fill="#180f16" />
        <rect x="112" y="466" width="62" height="7" rx="3" fill="#221720" />
        {/* keyboard + mouse */}
        <rect x="86" y="486" width="112" height="9" rx="3" fill="#2b1e25" />
        <ellipse cx="216" cy="490" rx="11" ry="7" fill="#2b1e25" />
        {/* chair, pushed back */}
        <rect x="118" y="596" width="96" height="14" rx="7" fill="#241a20" />
        <rect x="126" y="500" width="80" height="96" rx="14" fill="#2b1f26" />
        <rect x="160" y="610" width="9" height="44" fill="#1d1419" />
        <path d="M132 656h66" stroke="#1d1419" strokeWidth="9" strokeLinecap="round" />
      </g>

      {/* ---------- right: whiteboard and the wall clock ---------- */}
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

      {/* ---------- plants ---------- */}
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

      {/* ---------- two colleagues, backlit ----------
           Drawn *before* the couch so the backrest crops them at the shoulders,
           which is what sells the read of people sitting in it. */}
      <g fill="#120b11">
        {/* left: sunk back into the cushion, watching the light go */}
        <g className="colleague">
          <path d="M584 700q6-152 88-152t88 152z" />
          <circle cx="672" cy="504" r="37" />
          {/* rim light from the window */}
          <path
            d="M642 478q13-17 33-17"
            stroke="#ffb277"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </g>

        {/* right: hair tied back, head tipped toward the conversation */}
        <g className="colleague colleague-b">
          <path d="M832 700q6-146 84-146t84 146z" />
          <g transform="rotate(-8 916 520)">
            <circle cx="916" cy="512" r="35" />
            {/* shoulder-length hair, so the silhouette can't read as an ear */}
            <path d="M878 512q0-40 38-40t38 40q0 42-7 64h-62q-7-22-7-64z" />
          </g>
          <path
            d="M890 486q12-16 30-15"
            stroke="#ffb277"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        </g>
      </g>

      {/* ---------- the couch, seen from behind ---------- */}
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

      {/* ---------- side table: two cups of chai, still steaming ---------- */}
      <g>
        <rect x="1130" y="638" width="150" height="12" rx="5" fill="#5c3629" />
        <rect x="1142" y="650" width="9" height="92" fill="#3f2620" />
        <rect x="1259" y="650" width="9" height="92" fill="#3f2620" />

        {/* steam has to be drawn before the cups so it reads as behind them */}
        <g className="steam" stroke="#ffd9ab" strokeWidth="3.4" fill="none" strokeLinecap="round">
          <path className="steam-a" d="M1172 616q-9-16 0-30t-3-28" />
          <path className="steam-b" d="M1236 612q9-18 0-32t4-26" />
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

      {/* ---------- dust in the light ---------- */}
      <g fill="#ffe3ba">
        {MOTES.map((m, i) => (
          <circle
            key={i}
            className="mote"
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

      {/* ---------- grade ---------- */}
      <rect width="1600" height="900" fill="#ff8a4c" opacity="0.07" />
      <rect width="1600" height="900" fill="url(#vignette)" />
    </svg>
  )
}
