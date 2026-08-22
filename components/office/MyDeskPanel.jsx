'use client'

import { AnimatePresence, motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import { CloseIcon } from '@/components/ui/Icons'
import { SHORTCUTS } from '@/lib/constants'
import { useSession } from '@/providers/SessionProvider'

/**
 * My desk.
 *
 * The only screen in the building that is about you, and it is deliberately
 * almost empty: a figure, a handle, and a button that throws both away. There
 * is nothing to fill in and nothing to save, because there is no account here —
 * the costume is issued when you arrive and gone when you close the tab.
 *
 * Showing the reroll as a normal, expected action rather than as a settings
 * option is the point. Changing who you are should feel like standard equipment
 * in a building full of strangers.
 */
export default function MyDeskPanel({ open, self, onClose }) {
  const { reroll } = useSession()

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-void/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            aria-hidden="true"
          />

          <motion.aside
            className="panel-float fixed top-1/2 left-1/2 z-50 w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
            style={self ? { '--hue': self.hue } : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            aria-label="My desk"
          >
            <header className="flex items-center gap-3 px-5 pt-5">
              <span className="plate text-pencil">My desk</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-paper/6 p-0 text-chalk transition-colors duration-200 hover:text-paper [&_svg]:size-4"
              >
                <CloseIcon />
              </button>
            </header>

            {self ? (
              <div className="flex items-center gap-4 px-5 pt-4">
                <span className="inset grid size-20 flex-none place-items-end justify-items-center overflow-hidden rounded-xl text-[oklch(0.55_0.06_var(--hue))]">
                  <Persona seed={self.seed} seated className="h-16" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[17px] text-[oklch(0.88_0.07_var(--hue))]">
                    {self.handle}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-graphite">
                    Issued to this tab. No account, no history, nothing stored anywhere.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-5 px-5">
              <button
                type="button"
                onClick={reroll}
                className="w-full cursor-pointer rounded-xl border-0 bg-paper/8 py-2.5 text-[13px] font-semibold text-paper transition-colors duration-200 hover:bg-paper/14"
              >
                Become somebody else
              </button>
              <p className="mt-2 text-center text-[11px] text-pencil">
                New face, new name, same room. Nobody is told.
              </p>
            </div>

            <div className="mt-5 border-t border-paper/6 px-5 py-4">
              <p className="plate text-pencil">Getting around</p>
              <dl className="mt-2.5 flex flex-col">
                {SHORTCUTS.map(([keys, what]) => (
                  <div
                    key={what}
                    className="flex items-center gap-3 border-b border-paper/5 py-1.5 text-[12px] last:border-0"
                  >
                    <dt className="inset flex-none rounded px-1.5 py-0.5 font-mono text-[10.5px] text-paper/85">
                      {keys}
                    </dt>
                    <dd className="min-w-0 flex-1 text-right text-graphite">{what}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
