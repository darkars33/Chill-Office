'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  SpeakerIcon,
} from '@/components/ui/Icons'
import { formatClock } from '@/lib/utils/time'
import { thumbnailUrl } from '@/lib/utils/youtube'

/**
 * The stereo, parked in the corner of the windscreen.
 *
 * Everything the desk did, at a quarter of the size: what is on, how far
 * through it is, and the four controls you actually reach for while driving.
 * It takes the same props `<MusicDesk />` does, so it is wired from the same
 * `usePlayer()` values with no adapter in between.
 *
 * It sits above a game that has claimed the keyboard, so every control here has
 * to be reachable by pointer — and the seek bar deliberately keeps its native
 * range input rather than becoming a div, so it still works with a screen
 * reader and with the keyboard once you have tabbed into it.
 */
export default function MusicWidget({
  track,
  area,
  playing = false,
  ready = true,
  buffering = false,
  muted = false,
  time = 0,
  duration = 0,
  onSeek,
  onToggle,
  onNext,
  onPrevious,
  onToggleMute,
  className = '',
}) {
  const [scrubbing, setScrubbing] = useState(null)

  const total = duration || track?.seconds || 0
  const shown = scrubbing ?? time
  const progress = total > 0 ? Math.min(100, (shown / total) * 100) : 0
  const loading = !ready || (buffering && !playing)

  return (
    <section
      aria-label="Now playing"
      className={[
        'w-[268px] overflow-hidden rounded-2xl bg-black/55 ring-1 ring-white/10 backdrop-blur-md',
        'shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)]',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="relative size-11 flex-none overflow-hidden rounded-lg bg-white/5">
          {track?.id ? (
            <Image
              key={track.id}
              src={thumbnailUrl(track.id)}
              alt=""
              fill
              sizes="44px"
              draggable={false}
              className="scale-[1.34] object-cover object-center"
            />
          ) : null}
          {/* Three bars, running only while the track is. The one piece of
              motion in here, so a glance tells you whether sound is coming. */}
          {playing ? (
            <span className="absolute inset-x-0 bottom-0 flex h-3 items-end justify-center gap-[2px] bg-gradient-to-t from-black/80 to-transparent pb-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[2px] origin-bottom animate-levels rounded-full bg-white/90 motion-reduce:animate-none"
                  style={{ height: 7, animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          {/* ← YOUR TRACK DATA lands here. */}
          <p className="truncate text-[12.5px] font-semibold text-white" title={track?.title}>
            {track?.title ?? 'Nothing cued'}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] text-white/50">
            {track?.singers}
            {area?.name ? <span className="text-white/30"> · {area.name}</span> : null}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          className={[
            'grid size-7 flex-none cursor-pointer place-items-center rounded-md transition-colors',
            muted ? 'text-[rgb(var(--drive,255_96_176))]' : 'text-white/45 hover:text-white',
            '[&_svg]:size-[14px]',
          ].join(' ')}
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 pb-1">
        <span className="w-7 shrink-0 text-right font-mono text-[9.5px] tabular-nums text-white/40">
          {formatClock(shown)}
        </span>
        <div className="group relative flex h-3 min-w-0 flex-1 items-center">
          <div className="absolute inset-x-0 h-[3px] overflow-hidden rounded-full bg-white/15 transition-[height] duration-200 group-hover:h-[5px]">
            <div
              className="h-full rounded-full bg-[rgb(var(--drive,255_96_176))]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent opacity-0"
            min="0"
            max={Math.max(1, Math.floor(total))}
            step="1"
            value={Math.floor(shown)}
            aria-label="Seek"
            onChange={(e) => setScrubbing(Number(e.target.value))}
            onPointerUp={(e) => {
              onSeek?.(Number(e.currentTarget.value))
              setScrubbing(null)
            }}
            onKeyUp={(e) => {
              if (scrubbing === null) return
              onSeek?.(Number(e.currentTarget.value))
              setScrubbing(null)
            }}
          />
        </div>
        <span className="w-7 shrink-0 font-mono text-[9.5px] tabular-nums text-white/40">
          {formatClock(total)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-1 px-3 pt-1 pb-3">
        <Ghost onClick={onPrevious} label="Previous track">
          <PreviousIcon />
        </Ghost>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={playing ? 'Pause' : 'Play'}
          className="mx-1 grid size-9 cursor-pointer place-items-center rounded-full bg-white text-black transition-transform duration-150 hover:scale-105 active:scale-95 [&_svg]:size-[15px]"
        >
          {loading ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
          ) : playing ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        <Ghost onClick={onNext} label="Next track">
          <NextIcon />
        </Ghost>
      </div>
    </section>
  )
}

function Ghost({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 cursor-pointer place-items-center rounded-lg text-white/50 transition-colors duration-200 hover:text-white [&_svg]:size-[15px]"
    >
      {children}
    </button>
  )
}
