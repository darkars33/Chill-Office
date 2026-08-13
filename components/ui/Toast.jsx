/** Transient status line above the player. Stays mounted so it can animate out. */
export default function Toast({ message }) {
  return (
    <div className={message ? 'toast is-shown' : 'toast'} role="status" aria-live="polite">
      {message}
    </div>
  )
}
