import { SHORTCUTS } from '@/lib/constants'

/** The shortcut list, for screen readers. The rail shows the same list visually. */
export default function ScreenReaderHint() {
  return (
    <p className="sr-only">
      Keyboard shortcuts: {SHORTCUTS.map(([keys, what]) => `${keys} — ${what}`).join('. ')}.
    </p>
  )
}
