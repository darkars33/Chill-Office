import { CITY_WINDOWS } from '@/lib/scene-geometry'

// What you see out the window: the low sun, the towers across the road, and the
// birds heading home. Clipped to the glass so nothing spills into the room.
export default function CityView() {
  return (
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
        {CITY_WINDOWS.map((w, i) => (
          <rect
            key={i}
            className={
              w.lit
                ? 'animate-window-flicker opacity-[0.18] motion-reduce:animate-none'
                : 'opacity-[0.18]'
            }
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
      <g
        className="animate-birds-drift opacity-65 motion-reduce:animate-none"
        stroke="#3a2436"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M470 208l9-7 9 7" />
        <path d="M508 190l7-6 7 6" />
        <path d="M542 214l8-6 8 6" />
      </g>
    </g>
  )
}
