// Left of frame: somebody's desk, monitor still on, chair pushed back.
// The whole group is nudged inwards so the screen survives the 16:9 side crop.
export default function DeskArea() {
  return (
    <g transform="translate(60 0)">
      <rect x="24" y="470" width="234" height="12" rx="5" fill="#2e2027" />
      <rect x="40" y="482" width="10" height="182" fill="#241a20" />
      <rect x="232" y="482" width="10" height="182" fill="#241a20" />
      {/* monitor */}
      <rect x="70" y="352" width="146" height="98" rx="7" fill="#180f16" />
      <rect x="78" y="360" width="130" height="82" rx="4" fill="#2b4a52" />
      <rect
        className="animate-screen-glow opacity-[0.16] motion-reduce:animate-none"
        x="78"
        y="360"
        width="130"
        height="82"
        rx="4"
        fill="#6fd0d8"
      />
      {/* a few lines of code nobody will read till Monday */}
      <g fill="#0e1a1e" opacity="0.5">
        <rect x="86" y="370" width="62" height="4" rx="2" />
        <rect x="86" y="382" width="94" height="4" rx="2" />
        <rect x="94" y="394" width="74" height="4" rx="2" />
        <rect x="94" y="406" width="52" height="4" rx="2" />
        <rect x="86" y="418" width="84" height="4" rx="2" />
      </g>
      <rect
        className="animate-cursor-blink motion-reduce:animate-none"
        x="152"
        y="406"
        width="7"
        height="4"
        rx="2"
        fill="#0e1a1e"
      />
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
  )
}
