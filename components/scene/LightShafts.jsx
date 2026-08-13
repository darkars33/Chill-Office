// Three wedges of light spilling from the window panes onto the floor.
export default function LightShafts() {
  return (
    <g opacity="0.85">
      <polygon points="330,566 640,566 520,900 60,900" fill="url(#shaft)" />
      <polygon points="670,566 950,566 1010,900 590,900" fill="url(#shaft)" />
      <polygon points="990,566 1290,566 1560,900 1120,900" fill="url(#shaft)" />
    </g>
  )
}
