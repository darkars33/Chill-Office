/**
 * Mount point for the IFrame player. YouTube needs a real, laid-out iframe to
 * keep streaming, so this lives off-screen (see `.yt-host`) rather than hidden.
 */
export default function YouTubeHost({ hostRef }) {
  return (
    <div className="yt-host" aria-hidden="true">
      <div ref={hostRef} />
    </div>
  )
}
