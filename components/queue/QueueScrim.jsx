/** Click-catcher behind the drawer. Decorative — Escape closes it for keyboards. */
export default function QueueScrim({ open, onClick }) {
  return (
    <div className={open ? 'scrim is-open' : 'scrim'} onClick={onClick} aria-hidden="true" />
  )
}
