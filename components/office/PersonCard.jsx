'use client'

import { motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import { WhisperIcon } from '@/components/ui/Icons'

/** Roughly how long they have been on this floor. */
function since(joinedAt) {
  const minutes = Math.floor((Date.now() - joinedAt) / 60000)
  if (minutes < 1) return 'walked in a moment ago'
  if (minutes < 60) return `in the room ${minutes}m`
  return `in the room ${Math.floor(minutes / 60)}h`
}

/**
 * Everything you are allowed to know about somebody: the figure you are already
 * looking at, a handle, what they are doing, roughly how long they have been
 * here, and a way to say something.
 *
 * There is no profile behind this, and that limit is the product. The only way
 * to find out anything more is to ask them.
 */
export default function PersonCard({ person, status, onWhisper }) {
  return (
    <motion.div
      className="panel-float absolute bottom-[calc(100%+8px)] left-1/2 z-40 w-[212px] -translate-x-1/2 rounded-2xl p-3"
      style={{ '--hue': person.hue }}
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 440, damping: 32 }}
    >
      <div className="flex items-center gap-2.5">
        <span className="inset grid size-11 flex-none place-items-end justify-items-center overflow-hidden rounded-lg text-[oklch(0.52_0.05_var(--hue))]">
          <Persona seed={person.seed} seated={person.seated} className="h-9" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[12.5px] text-[oklch(0.86_0.075_var(--hue))]">
            {person.handle}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span
              className={`size-1 rounded-full ${person.away ? 'bg-away' : 'bg-present'}`}
              aria-hidden="true"
            />
            <span className="text-[11px] text-graphite">{status.label}</span>
          </span>
        </span>
      </div>

      <p className="mt-2 font-mono text-[10px] text-pencil">{since(person.joinedAt)}</p>

      <button
        type="button"
        className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-[oklch(0.62_0.075_var(--hue)/0.22)] py-2 text-[12px] font-semibold text-[oklch(0.88_0.06_var(--hue))] transition-colors duration-200 hover:bg-[oklch(0.62_0.075_var(--hue)/0.34)] [&_svg]:size-[13px]"
        onClick={onWhisper}
      >
        <WhisperIcon />
        Say something to them
      </button>
    </motion.div>
  )
}
