'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { hash, range, rng } from '@/lib/seed'

/**
 * How loud the music is, per animation frame.
 *
 * WHY THIS IS SIMULATED BY DEFAULT
 * Playback in this app comes out of a YouTube IFrame embed. That audio lives in
 * a cross-origin document, so there is no media element on this page to hand to
 * `AudioContext.createMediaElementSource` and no legitimate way to attach an
 * `AnalyserNode` to it. Real spectrum data is not merely awkward here, it is not
 * available at all — so the default path *derives* a plausible envelope from the
 * player clock instead of measuring one.
 *
 * That turns out to be more than a consolation prize. A derived envelope is
 * seeded from the track id, so the same song always drives at the same tempo; it
 * never drifts, never needs a user gesture, and costs nothing per frame.
 *
 * THE REAL PATH IS STILL HERE
 * Pass `mediaRef` pointing at a same-origin `<audio>` or `<video>` element — if
 * you ever swap YouTube for files you host — and the hook wires up a real
 * analyser and reports `live: true`. Nothing downstream changes; the game loop
 * reads the same numbers either way.
 *
 * READ IT, DO NOT SUBSCRIBE TO IT
 * `read()` returns the *same* mutable object every call. It is meant to be
 * called inside `requestAnimationFrame` and consumed immediately. Putting sixty
 * amplitude values a second into React state would re-render the tree sixty
 * times a second, which is the one thing this component must never do.
 *
 * @param {object}  options
 * @param {boolean} options.playing   is the track running right now
 * @param {number}  options.time      player clock in seconds — only ticks a few
 *                                    times a second, so it is interpolated below
 * @param {string}  options.trackId   seeds the simulated tempo
 * @param {object}  [options.mediaRef] ref to a same-origin media element, if any
 */
export function useAudioEnergy({ playing, time, trackId, mediaRef = null }) {
  const [live, setLive] = useState(false)

  /**
   * A tempo for this track. Hindi film classics from the 70s–90s sit in a
   * fairly narrow band, so the range is narrow too — nothing here should feel
   * like drum and bass.
   */
  const bpm = useMemo(() => {
    const next = rng(hash(String(trackId ?? 'silence')) ^ 0x0bea71)
    return range(next, 84, 124)
  }, [trackId])

  // The player only reports `time` every 250ms. Stamping each report against
  // `performance.now()` lets the loop interpolate between them, which is the
  // difference between a beat that lands and a beat that stutters four times a
  // second.
  const clockRef = useRef({ time: 0, stamp: 0 })
  useEffect(() => {
    clockRef.current = { time, stamp: typeof performance === 'undefined' ? 0 : performance.now() }
  }, [time])

  const playingRef = useRef(playing)
  playingRef.current = playing

  const bpmRef = useRef(bpm)
  bpmRef.current = bpm

  // Smoothed output, plus the analyser rig when there is one to build.
  const stateRef = useRef({ energy: 0, bass: 0, kick: 0 })
  const analyserRef = useRef(null)
  const binsRef = useRef(null)

  // ── real analyser, only if a same-origin element was handed to us ──────────
  useEffect(() => {
    const media = mediaRef?.current
    if (!media || !playing || analyserRef.current) return undefined

    let ctx
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return undefined
      ctx = new AudioCtx()
      const source = ctx.createMediaElementSource(media)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.72
      // Straight back out to the speakers — routing through WebAudio replaces
      // the element's own output, so skipping this silences the track.
      source.connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = { ctx, analyser }
      binsRef.current = new Uint8Array(analyser.frequencyBinCount)
      ctx.resume?.()
      setLive(true)
    } catch {
      // Tainted by CORS, already wired to another graph, or no autoplay gesture
      // yet. All three mean the same thing here: fall back to the simulation.
      ctx?.close?.()
      analyserRef.current = null
      setLive(false)
    }

    return undefined
  }, [mediaRef, playing])

  useEffect(
    () => () => {
      analyserRef.current?.ctx?.close?.()
      analyserRef.current = null
    },
    [],
  )

  /**
   * @param {number} now  `performance.now()` for this frame
   * @param {number} dt   seconds since the last frame, already clamped
   * @returns {{energy: number, bass: number, kick: number, beat: number}}
   *   `energy` 0–1 overall loudness, `bass` 0–1 low end, `kick` 0–1 a sharp
   *   transient that spikes on each beat, `beat` 0–1 position within the bar.
   */
  const read = useCallback((now, dt) => {
    const out = stateRef.current
    const isPlaying = playingRef.current

    // Interpolated position in the track.
    const clock = clockRef.current
    const elapsed = isPlaying ? Math.max(0, (now - clock.stamp) / 1000) : 0
    const at = clock.time + elapsed

    const beats = (at * bpmRef.current) / 60
    const beatPhase = beats - Math.floor(beats)
    out.beat = (beats / 4) % 1

    let targetBass
    let targetEnergy

    const rig = analyserRef.current
    if (rig && binsRef.current) {
      // Measured: the first handful of bins are the kick and bass guitar, the
      // whole array averaged is roughly perceived loudness.
      rig.analyser.getByteFrequencyData(binsRef.current)
      const bins = binsRef.current
      let low = 0
      for (let i = 1; i < 8; i += 1) low += bins[i]
      let all = 0
      for (let i = 0; i < bins.length; i += 1) all += bins[i]
      targetBass = low / (7 * 255)
      targetEnergy = all / (bins.length * 255)
    } else {
      // Simulated: a kick on every beat, a lighter hit on the offbeat, and a
      // slow swell across each eight-bar section so the world has long arcs in
      // it as well as short ones.
      const kick = (1 - beatPhase) ** 3
      const offPhase = (beats + 0.5) % 1
      const snare = Math.floor(beats) % 2 === 1 ? (1 - offPhase) ** 4 * 0.5 : 0
      const section = 0.5 + 0.5 * Math.sin((beats / 32) * Math.PI * 2)
      targetBass = Math.min(1, kick * 0.85 + snare * 0.4 + section * 0.2)
      targetEnergy = Math.min(1, 0.42 + section * 0.34 + kick * 0.22)
    }

    if (!isPlaying) {
      targetBass = 0
      targetEnergy = 0
    }

    // Frame-rate independent smoothing. Bass is allowed to snap so a kick still
    // reads as a hit; overall energy is deliberately sluggish so the landscape
    // swells rather than strobes.
    const snap = 1 - Math.exp(-26 * dt)
    const glide = 1 - Math.exp(-3.2 * dt)
    out.bass += (targetBass - out.bass) * snap
    out.energy += (targetEnergy - out.energy) * glide

    // The transient on its own: what is left of the bass once the slow-moving
    // part is subtracted. This is what the beat-reactive visuals key off.
    out.kick = Math.max(0, out.bass - out.energy * 0.55) * (isPlaying ? 1 : 0)

    return out
  }, [])

  return { read, bpm, live }
}
