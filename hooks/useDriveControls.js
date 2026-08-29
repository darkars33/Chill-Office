'use client'

import { useEffect, useRef } from 'react'
import { isTypingTarget } from '@/lib/utils/dom'

/**
 * The pedals and the wheel.
 *
 * Driving needs to know whether a key is *held*, not whether it was pressed, so
 * this tracks key state rather than key events. The result lives in a ref that
 * the game loop samples once a frame — no state, no re-renders, no input lag
 * from React's scheduler sitting between the keyboard and the physics.
 *
 * A held key produces a value that ramps rather than snapping to 1. That ramp
 * is the difference between a car and a cursor: a real throttle takes a moment
 * to open and a real wheel takes a moment to reach full lock, and without it
 * every input feels like teleporting.
 *
 * Keys are claimed in the capture phase so this beats any app-level shortcut
 * bound to the same keys — this app already uses the arrows for seeking and D
 * for the directory. Set `capture` false to let those through instead.
 */
export function useDriveControls({ enabled = true, capture = true } = {}) {
  /**
   * @type {import('react').RefObject<{
   *   throttle: number, brake: number, steer: number, handbrake: boolean,
   *   throttleHeld: boolean, brakeHeld: boolean, steerLeft: boolean, steerRight: boolean,
   * }>}
   */
  const input = useRef({
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: false,
    throttleHeld: false,
    brakeHeld: false,
    steerLeft: false,
    steerRight: false,
  })

  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    const held = input.current

    const set = (key, down) => {
      switch (key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          held.throttleHeld = down
          return true
        case 's':
        case 'S':
        case 'ArrowDown':
          held.brakeHeld = down
          return true
        case 'a':
        case 'A':
        case 'ArrowLeft':
          held.steerLeft = down
          return true
        case 'd':
        case 'D':
        case 'ArrowRight':
          held.steerRight = down
          return true
        case ' ':
        case 'Shift':
          held.handbrake = down
          return true
        default:
          return false
      }
    }

    const handle = (event, down) => {
      if (!enabledRef.current) return
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      if (!set(event.key, down)) return
      event.preventDefault()
      if (capture) event.stopPropagation()
    }

    const onDown = (event) => handle(event, true)
    const onUp = (event) => handle(event, false)

    // A key held while the window loses focus never sends its keyup, and the
    // car drives off into the distance on its own. Let go of everything.
    const release = () => {
      held.throttleHeld = false
      held.brakeHeld = false
      held.steerLeft = false
      held.steerRight = false
      held.handbrake = false
    }

    const options = { capture }
    window.addEventListener('keydown', onDown, options)
    window.addEventListener('keyup', onUp, options)
    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', release)

    return () => {
      window.removeEventListener('keydown', onDown, options)
      window.removeEventListener('keyup', onUp, options)
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', release)
      release()
    }
  }, [capture])

  /**
   * Ramp the held flags into analogue values. Called once per frame by the loop.
   *
   * @param {number} dt seconds since the last frame
   */
  const sample = (dt) => {
    const held = input.current
    // Rates in units per second: the throttle opens quickly, the wheel takes a
    // beat to reach lock, and both centre faster than they engage so lifting off
    // feels immediate.
    const toward = (value, target, rise, fall) => {
      const rate = Math.abs(target) > Math.abs(value) ? rise : fall
      const step = rate * dt
      if (target > value) return Math.min(target, value + step)
      if (target < value) return Math.max(target, value - step)
      return value
    }

    held.throttle = toward(held.throttle, held.throttleHeld ? 1 : 0, 3.2, 6)
    held.brake = toward(held.brake, held.brakeHeld ? 1 : 0, 6, 8)

    const wanted = (held.steerRight ? 1 : 0) - (held.steerLeft ? 1 : 0)
    held.steer = toward(held.steer, wanted, 4.2, 7)

    return held
  }

  return { input, sample }
}
