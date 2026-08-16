'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { thumbnailUrl } from '@/lib/utils/youtube'

/**
 * The sleeve, with the record sliding out from behind it while it plays.
 *
 * The slide and the spin are separate elements on purpose: both would otherwise
 * be writing `transform`, and the CSS spin would clobber the motion offset.
 *
 * @param {object} props
 * @param {object} props.track
 * @param {boolean} props.playing
 * @param {boolean} [props.compact] tighter radii and a shorter slide, for the ambience player
 */
export default function CoverArt({ track, playing, compact = false }) {
  return (
    <div className="relative aspect-square w-full">
      {/* Colour bleed under the whole thing, so the art sits in its own light. */}
      <div
        className="absolute inset-[8%] -z-1 rounded-full bg-[radial-gradient(circle,rgba(255,140,80,0.5),transparent_70%)] blur-[46px]"
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ x: playing ? (compact ? '22%' : '30%') : '5%', scale: playing ? 1 : 0.9 }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        aria-hidden="true"
      >
        <Record playing={playing} />
      </motion.div>

      <AnimatePresence initial={false}>
        <motion.div
          key={track.id}
          className={[
            'absolute inset-0 overflow-hidden bg-slate',
            'shadow-[0_30px_70px_-24px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(230,220,255,0.12)]',
            compact ? 'rounded-2xl' : 'rounded-[26px]',
          ].join(' ')}
          initial={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* hqdefault is 480×360 with letterbox bars; 1.34 is exactly the zoom
              that pushes them out of a square crop. */}
          <Image
            src={thumbnailUrl(track.id)}
            alt=""
            fill
            sizes="(min-width: 1024px) 340px, 60vw"
            priority
            draggable={false}
            className="scale-[1.34] object-cover object-center"
          />
          <span className="absolute inset-0 bg-[linear-gradient(150deg,rgba(255,255,255,0.14),transparent_38%,rgba(4,2,9,0.42))]" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** Black vinyl with grooves, a coloured label and a spindle hole. */
function Record({ playing }) {
  return (
    <div
      className={[
        'relative size-full animate-sleeve-spin rounded-full [will-change:rotate] motion-reduce:animate-none',
        'bg-[repeating-radial-gradient(circle_at_center,#15121b_0px,#15121b_2px,#0d0b12_3px,#0d0b12_5px)]',
        'shadow-[0_24px_50px_-18px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(230,220,255,0.08)]',
      ].join(' ')}
      // Pausing rather than dropping the animation leaves the record where it
      // stopped instead of snapping back to zero.
      style={{ animationPlayState: playing ? 'running' : 'paused' }}
    >
      <span className="absolute top-1/2 left-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(140deg,#ffb26b,#ff7a59_46%,#a98bff)] shadow-[inset_0_0_14px_rgba(0,0,0,0.35)]" />
      <span className="absolute top-1/2 left-1/2 size-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-void shadow-[0_0_0_1px_rgba(0,0,0,0.6)]" />
    </div>
  )
}
