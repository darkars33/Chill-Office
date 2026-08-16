// Two colleagues, backlit to silhouettes, breathing slightly out of sync.
//
// Drawn *before* <Couch /> so the backrest crops them at the shoulders, which is
// what sells the read of people sitting in it.
export default function Colleagues() {
  return (
    <g fill="#120b11">
      {/* left: sunk back into the cushion, watching the light go */}
      <g className="animate-colleague-breathe [transform-origin:672px_700px] motion-reduce:animate-none">
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
      <g className="animate-colleague-breathe [transform-origin:916px_700px] [animation-duration:7.8s] [animation-delay:-1.4s] motion-reduce:animate-none">
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
  )
}
