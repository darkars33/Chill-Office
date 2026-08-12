import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import OfficeScene from './OfficeScene.jsx'
import { PLAYLIST } from './playlist.js'
import { useYouTubePlayer } from './useYouTubePlayer.js'

const clock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function shuffled(indices, first) {
  const rest = indices.filter((i) => i !== first)
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return first === undefined ? rest : [first, ...rest]
}

// Whatever the office is doing at this hour.
function shiftLabel(hour) {
  if (hour < 5) return 'Late shift'
  if (hour < 11) return 'Morning shift'
  if (hour < 14) return 'Lunch break'
  if (hour < 17) return 'Chai break'
  if (hour < 20) return 'Golden hour'
  if (hour < 23) return 'Overtime'
  return 'Late shift'
}

const NATURAL = PLAYLIST.map((_, i) => i)

export default function App() {
  const [order, setOrder] = useState(NATURAL)
  const [pointer, setPointer] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [toast, setToast] = useState('')
  const [scrubbing, setScrubbing] = useState(null)
  const [broken, setBroken] = useState(() => new Set())

  const toastTimer = useRef(null)
  const trackIndex = order[pointer] ?? 0
  const song = PLAYLIST[trackIndex]

  const say = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ---- desk clock ----
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const step = useCallback(
    (delta) => {
      setPointer((p) => (p + delta + order.length) % order.length)
    },
    [order.length],
  )

  const handleEnded = useCallback(() => step(1), [step])

  const handleUnavailable = useCallback(
    (code) => {
      const seen = new Set(broken)
      seen.add(song.id)
      setBroken(seen)
      // eslint-disable-next-line no-console
      console.warn(`YouTube refused ${song.id} (error ${code})`)

      // Don't chase our own tail if the whole queue is unplayable.
      if (seen.size >= PLAYLIST.length) {
        say('No tracks are playable right now')
        return
      }
      say(`“${song.title}” won’t play here — skipping`)
      step(1)
    },
    [broken, song, say, step],
  )

  const player = useYouTubePlayer({
    videoId: song.id,
    fallbackDuration: song.seconds,
    onEnded: handleEnded,
    onUnavailable: handleUnavailable,
  })

  const { armAutoplay, playing, ready, buffering, time, duration, toggle, seek, nudge } = player

  const total = duration || song.seconds || 0
  const shown = scrubbing ?? time
  const progress = total > 0 ? Math.min(100, (shown / total) * 100) : 0

  const jumpTo = useCallback(
    (playlistIndex) => {
      const at = order.indexOf(playlistIndex)
      if (at === -1) return
      armAutoplay()
      setPointer(at)
    },
    [order, armAutoplay],
  )

  const skip = useCallback(
    (delta) => {
      if (playing) armAutoplay()
      step(delta)
    },
    [playing, armAutoplay, step],
  )

  const toggleShuffle = useCallback(() => {
    // Computed out here rather than inside a state updater: StrictMode invokes
    // updaters twice, which would reshuffle and land on a different track.
    const next = !shuffle
    setShuffle(next)
    if (next) {
      setOrder(shuffled(NATURAL, trackIndex))
      setPointer(0)
    } else {
      setOrder(NATURAL)
      setPointer(trackIndex)
    }
    say(next ? 'Shuffle on' : 'Shuffle off')
  }, [shuffle, trackIndex, say])

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.metaKey || event.ctrlKey) return

      switch (event.key) {
        case ' ':
          event.preventDefault()
          toggle()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) skip(1)
          else nudge(5)
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) skip(-1)
          else nudge(-5)
          break
        case 'm':
        case 'M':
          player.toggleMute()
          say(player.muted ? 'Sound on' : 'Muted')
          break
        case 's':
        case 'S':
          toggleShuffle()
          break
        case 'q':
        case 'Q':
          setQueueOpen((open) => !open)
          break
        case 'Escape':
          setQueueOpen(false)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, skip, nudge, toggleShuffle, player, say])

  const hh = String(now.getHours() % 12 || 12).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const meridiem = now.getHours() < 12 ? 'AM' : 'PM'

  const thumb = `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`
  const position = useMemo(() => `${pointer + 1} / ${order.length}`, [pointer, order.length])

  return (
    <main className="stage">
      <OfficeScene />

      <div className="desk-clock">
        <time dateTime={now.toISOString()}>
          {hh}
          <span className="clock-colon">:</span>
          {mm} {meridiem}
        </time>
        <small>{shiftLabel(now.getHours())}</small>
      </div>

      <p className={playing ? 'now-badge is-playing' : 'now-badge'}>
        <span className="now-dot" aria-hidden="true" />
        <span>
          {song.film} · {song.year}
        </span>
      </p>

      <nav className="top-links" aria-label="Links and options">
        <button type="button" onClick={() => setQueueOpen(true)} aria-expanded={queueOpen}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h11M4 12h11M4 17h7" />
            <path d="M19 10v8" />
            <circle cx="17" cy="18" r="2" />
          </svg>
          <span>Queue · 50</span>
        </button>

        <button
          type="button"
          onClick={() => {
            player.toggleMute()
            say(player.muted ? 'Sound on' : 'Muted')
          }}
          aria-pressed={player.muted}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 9v6h3l4.5 4V5L8 9H5z" fill="currentColor" />
            {player.muted ? (
              <path d="M17 9.5l4 5M21 9.5l-4 5" />
            ) : (
              <path d="M16.5 8.8a4.5 4.5 0 010 6.4M19 6.5a8 8 0 010 11" />
            )}
          </svg>
          <span>{player.muted ? 'Muted' : 'Sound'}</span>
        </button>

        <a
          href={`https://www.youtube.com/watch?v=${song.id}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open “${song.title}” on YouTube`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 002.4 7.2C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 001.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 001.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8z"
              fill="currentColor"
              stroke="none"
            />
            <path d="M10.2 9.3l4.6 2.7-4.6 2.7V9.3z" fill="#2a1a20" stroke="none" />
          </svg>
          <span>YouTube</span>
        </a>
      </nav>

      {/* YouTube needs a real, laid-out iframe to keep streaming — it lives off-screen */}
      <div className="yt-host" aria-hidden="true">
        <div ref={player.hostRef} />
      </div>

      <section className="player" aria-label="Music player">
        <div className={playing ? 'sleeve is-playing' : 'sleeve'}>
          <img src={thumb} alt="" loading="lazy" draggable="false" />
        </div>

        <div className="track">
          <div className="track-copy">
            <strong title={song.title}>{song.title}</strong>
            <span title={`${song.singers} · ${song.film} (${song.year})`}>{song.singers}</span>
          </div>

          <div className="scrub" style={{ '--progress': `${progress}%` }}>
            <input
              type="range"
              min="0"
              max={Math.max(1, Math.floor(total))}
              step="1"
              value={Math.floor(shown)}
              aria-label="Seek"
              onChange={(e) => setScrubbing(Number(e.target.value))}
              onPointerUp={(e) => {
                seek(Number(e.currentTarget.value))
                setScrubbing(null)
              }}
              onKeyUp={(e) => {
                if (scrubbing !== null) {
                  seek(Number(e.currentTarget.value))
                  setScrubbing(null)
                }
              }}
            />
          </div>

          <div className="times">
            <span>{clock(shown)}</span>
            <span className="spacer">{position}</span>
            <span>{clock(total)}</span>
          </div>
        </div>

        <div className="controls">
          <button
            type="button"
            className={shuffle ? 'icon-btn is-on' : 'icon-btn'}
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label="Shuffle"
            title="Shuffle (S)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 4l3 3-3 3" />
              <path d="M20 7H16c-2 0-3 1-4.4 3.2L9.6 13.4C8.4 15.3 7.3 17 5 17H3" />
              <path d="M17 14l3 3-3 3" />
              <path d="M3 7h2c1.6 0 2.6.9 3.6 2.2" />
              <path d="M13.2 15c1.2 1.5 2.2 2 3.8 2h3" />
            </svg>
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => skip(-1)}
            aria-label="Previous track"
            title="Previous (Shift + ←)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6v12L9 12l9-6z" fill="currentColor" stroke="none" />
              <path d="M6 5v14" />
            </svg>
          </button>

          <button
            type="button"
            className="play-btn"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? 'Pause' : 'Play'}
            title="Play / pause (Space)"
          >
            {!ready || (buffering && !playing) ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <>
                <span className="play-icon" aria-hidden="true" />
                <span className="pause-icon" aria-hidden="true" />
              </>
            )}
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => skip(1)}
            aria-label="Next track"
            title="Next (Shift + →)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6v12l9-6-9-6z" fill="currentColor" stroke="none" />
              <path d="M18 5v14" />
            </svg>
          </button>
        </div>
      </section>

      <div className={toast ? 'toast is-shown' : 'toast'} role="status" aria-live="polite">
        {toast}
      </div>

      <div
        className={queueOpen ? 'scrim is-open' : 'scrim'}
        onClick={() => setQueueOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={queueOpen ? 'queue is-open' : 'queue'}
        aria-label="Playlist"
        aria-hidden={!queueOpen}
      >
        <div className="queue-head">
          <div>
            <h2>The Chill Queue</h2>
            <p>50 classics, 1970&ndash;1999 · {shuffle ? 'shuffled' : 'in order'}</p>
          </div>
          <button
            type="button"
            className="queue-close"
            onClick={() => setQueueOpen(false)}
            aria-label="Close playlist"
          >
            &times;
          </button>
        </div>

        <ol className="queue-list">
          {order.map((playlistIndex, slot) => {
            const item = PLAYLIST[playlistIndex]
            const current = slot === pointer
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={current ? 'queue-row is-current' : 'queue-row'}
                  onClick={() => jumpTo(playlistIndex)}
                  aria-current={current ? 'true' : undefined}
                >
                  {current ? (
                    <span className={playing ? 'bars' : 'bars is-paused'} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span className="queue-num">{slot + 1}</span>
                  )}
                  <span className="queue-meta">
                    <strong>
                      {item.title}
                      {broken.has(item.id) ? ' ⚠' : ''}
                    </strong>
                    <span>
                      {item.singers} · {item.film} ({item.year})
                    </span>
                  </span>
                  <span className="queue-len">{clock(item.seconds)}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </aside>

      <p className="sr-only">
        Keyboard: space plays or pauses, arrow keys seek, shift and arrow keys change track, S
        shuffles, M mutes, Q opens the playlist.
      </p>
    </main>
  )
}
