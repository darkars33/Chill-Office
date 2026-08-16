/** Click-catcher behind the drawer. Decorative — Escape closes it for keyboards. */
export default function QueueScrim({ open, onClick }) {
  return (
    <div
      className={[
        'fixed inset-0 z-4 bg-[#080407]/50 transition-opacity duration-[280ms]',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}
