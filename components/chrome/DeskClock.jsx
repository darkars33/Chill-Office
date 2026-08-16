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
    <div
      className={[
        'fixed z-2 flex flex-col gap-[3px] font-bold leading-none text-shadow-chrome',
        'top-[calc(14px+env(safe-area-inset-top))] left-[14px]',
        'pill:top-[clamp(18px,3vw,30px)] pill:left-[clamp(18px,3vw,32px)]',
      ].join(' ')}
    >
      <time
        dateTime={now.toISOString()}
        className="text-[13px] tracking-[-0.02em] text-cream/95 tabular-nums pill:text-[15px]"
      >
        {hh}
        <span className="inline-block animate-clock-blink motion-reduce:animate-none">:</span>
        {mm} {meridiem}
      </time>
      <small className="text-[10px] font-semibold tracking-[0.06em] text-peach/78 uppercase pill:text-[11px]">
        {shift}
      </small>
    </div>
  )
}
