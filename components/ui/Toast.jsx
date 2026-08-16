/** Transient status line above the player. Stays mounted so it can animate out. */
export default function Toast({ message }) {
  return (
    <div
      className={[
        'pointer-events-none fixed left-1/2 z-4 -translate-x-1/2 rounded-full border',
        'border-shell/20 bg-[#180f14]/90 px-[15px] py-2 backdrop-blur-[10px]',
        'text-[12px] [font-weight:650] whitespace-nowrap',
        'transition-[opacity,transform] duration-[220ms]',
        // Parked above the player, which itself sits higher on wider screens.
        'bottom-[calc(12px+env(safe-area-inset-bottom)+128px)]',
        'pill:bottom-[calc(clamp(18px,6vh,54px)+112px)]',
        message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
