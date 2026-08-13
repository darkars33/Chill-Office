// Final grade over the whole frame: a warm wash and a vignette.
export default function ColorGrade() {
  return (
    <>
      <rect width="1600" height="900" fill="#ff8a4c" opacity="0.07" />
      <rect width="1600" height="900" fill="url(#vignette)" />
    </>
  )
}
