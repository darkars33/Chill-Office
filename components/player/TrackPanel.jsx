'use client'

import { useState } from 'react'
import SeekBar from '@/components/player/SeekBar'
import { formatClock } from '@/lib/utils/time'

/**
 * Title, singers, seek bar and timings. Owns the drag state because both the bar
 * and the elapsed readout need to show the dragged position, not the real one.
 */
export default function TrackPanel({ track, time, duration, position, onSeek }) {
  const [scrubbing, setScrubbing] = useState(null)

  // YouTube only reports a duration once it has loaded; until then use ours.
  const total = duration || track.seconds || 0
  const shown = scrubbing ?? time

  const commit = (seconds) => {
    onSeek(seconds)
    setScrubbing(null)
  }

  return (
    <div className="flex min-w-0 flex-col justify-center self-stretch">
      <div className="mb-[5px] flex min-w-0 flex-col gap-0.5 wide:mb-2">
        <strong
          title={track.title}
          className="truncate text-[13px] [font-weight:750] tracking-[-0.01em] wide:text-[14px]"
        >
          {track.title}
        </strong>
        <span
          title={`${track.singers} · ${track.film} (${track.year})`}
          className="truncate text-[11px] text-linen/74"
        >
          {track.singers}
        </span>
      </div>

      <SeekBar
        value={shown}
        max={total}
        isScrubbing={scrubbing !== null}
        onScrub={setScrubbing}
        onCommit={commit}
      />

      <div className="mt-[3px] flex gap-1 text-[10px] leading-none text-linen/62 tabular-nums">
        <span>{formatClock(shown)}</span>
        <span className="ml-auto">{position}</span>
        <span>{formatClock(total)}</span>
      </div>
    </div>
  )
}
