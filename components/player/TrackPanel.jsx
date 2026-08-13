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
    <div className="track">
      <div className="track-copy">
        <strong title={track.title}>{track.title}</strong>
        <span title={`${track.singers} · ${track.film} (${track.year})`}>{track.singers}</span>
      </div>

      <SeekBar
        value={shown}
        max={total}
        isScrubbing={scrubbing !== null}
        onScrub={setScrubbing}
        onCommit={commit}
      />

      <div className="times">
        <span>{formatClock(shown)}</span>
        <span className="spacer">{position}</span>
        <span>{formatClock(total)}</span>
      </div>
    </div>
  )
}
