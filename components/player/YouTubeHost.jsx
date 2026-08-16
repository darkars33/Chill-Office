/**
 * Mount point for the IFrame player. YouTube needs a real, laid-out iframe to
 * keep streaming, so this is parked off-screen rather than hidden.
 */
export default function YouTubeHost({ hostRef }) {
  return (
    <div
      className="pointer-events-none fixed top-0 -left-[10000px] h-[200px] w-[356px] border-0 opacity-[0.001]"
      aria-hidden="true"
    >
      <div ref={hostRef} />
    </div>
  )
}
