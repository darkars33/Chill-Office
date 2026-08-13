'use client'

import { useClock } from '@/hooks/useClock'
import { clockParts } from '@/lib/utils/time'

/** Top-left clock with a label for whatever the office is doing at this hour. */
export default function DeskClock() {
  const now = useClock()

  // Nothing to show until the browser tells us the local time.
  if (!now) return null

  const { hh, mm, meridiem, shift } = clockParts(now)

  return (
    <div className="desk-clock">
      <time dateTime={now.toISOString()}>
        {hh}
        <span className="clock-colon">:</span>
        {mm} {meridiem}
      </time>
      <small>{shift}</small>
    </div>
  )
}
