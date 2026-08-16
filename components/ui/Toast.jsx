'use client'

import { AnimatePresence, motion } from 'motion/react'

/** Transient status line, centred above the player. */
export default function Toast({ message }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(74px+env(safe-area-inset-top))] z-30 flex justify-center lg:top-24"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {message ? (
          <motion.p
            key={message}
            className="glass rounded-full border border-shell/14 px-4 py-2 text-[12px] font-semibold whitespace-nowrap text-cream"
            initial={{ opacity: 0, y: -14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 32 }}
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
