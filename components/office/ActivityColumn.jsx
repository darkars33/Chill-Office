'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import { CloseIcon, SendIcon, WhisperIcon } from '@/components/ui/Icons'
import { REACTIONS } from '@/lib/constants'
import { MESSAGE_TTL } from '@/lib/presence'

/**
 * The side of the room where things are written down.
 *
 * Conversation and ambient activity share one column and one timeline, because
 * in an actual office they share one experience — somebody arriving and
 * somebody saying something are both just noise off to your left that you
 * either look up for or do not. Splitting them into two feeds would be tidier
 * and would feel much less like a place.
 *
 * Activity lines are set small and dim; messages are set full size. That
 * difference in weight is the only separation they need.
 */
export default function ActivityColumn({
  messages,
  activity,
  whispers,
  self,
  onSay,
  onReact,
  onWhisper,
  onSendWhisper,
  onCloseWhisper,
  composerRef,
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 4000)
    return () => clearInterval(id)
  }, [])

  // One timeline. Messages outlive activity notes, which are ephemeral by
  // nature — nobody needs to know who walked in four minutes ago.
  const feed = useMemo(() => {
    const said = messages
      .filter((m) => now - m.at < MESSAGE_TTL)
      .map((m) => ({ ...m, row: 'said' }))
    const happened = activity
      .filter((a) => now - a.at < 70000)
      .map((a) => ({ ...a, row: 'happened' }))
    return [...said, ...happened].sort((a, b) => a.at - b.at).slice(-40)
  }, [messages, activity, now])

  const threads = Object.values(whispers)

  return (
    <aside
      className="panel relative z-30 flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl lg:w-[326px] lg:shrink-0"
      aria-label="Conversation and activity"
    >
      <header className="flex flex-none items-center gap-2 border-b border-paper/6 px-4 py-3">
        <span className="plate text-pencil">In the room</span>
        <span className="ml-auto font-mono text-[10px] text-pencil">
          nothing here is saved
        </span>
      </header>

      <div className="mask-fade-t flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((row) =>
            row.row === 'said' ? (
              <Said key={row.id} message={row} onWhisper={onWhisper} />
            ) : (
              <Happened key={row.id} note={row} />
            ),
          )}
        </AnimatePresence>

        {feed.length === 0 ? (
          <p className="py-6 text-[12.5px] leading-relaxed text-graphite/70">
            Quiet in here.
            <br />
            <span className="text-pencil">
              Say something — it disappears on its own in a minute or two.
            </span>
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {threads.map((thread) => (
          <Whisper
            key={thread.peer.id}
            thread={thread}
            onSend={(text) => onSendWhisper(thread.peer.id, text)}
            onClose={() => onCloseWhisper(thread.peer.id)}
            onOpen={() => onWhisper(thread.peer.id)}
          />
        ))}
      </AnimatePresence>

      <Composer ref={composerRef} self={self} onSay={onSay} onReact={onReact} />
    </aside>
  )
}

/** Something somebody said. */
function Said({ message, onWhisper }) {
  return (
    <motion.div
      layout="position"
      className="flex items-start gap-2"
      style={{ '--hue': message.hue }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
    >
      <button
        type="button"
        className="mt-[3px] grid size-6 flex-none cursor-pointer place-items-end justify-items-center overflow-hidden rounded-md border-0 bg-paper/6 p-0 text-[oklch(0.6_0.06_var(--hue))] disabled:cursor-default"
        onClick={() => onWhisper?.(message.authorId)}
        disabled={message.mine}
        title={message.mine ? undefined : `Say something to ${message.handle}`}
      >
        <Persona seed={message.seed} seated className="h-5" />
      </button>
      <p className="min-w-0 flex-1">
        <span className="font-mono text-[11px] text-[oklch(0.84_0.07_var(--hue))]">
          {message.handle}
          {message.mine ? <span className="text-pencil"> (you)</span> : null}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-paper/88">{message.text}</span>
      </p>
    </motion.div>
  )
}

const VERB = {
  join: 'walked in',
  leave: 'left the room',
  react: 'reacted',
}

/** Ambient office noise, set quiet enough to skim past. */
function Happened({ note }) {
  return (
    <motion.p
      layout="position"
      className="flex items-center gap-1.5 pl-8 text-[11px] text-pencil"
      style={{ '--hue': note.hue }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="size-1 flex-none rounded-full bg-[oklch(0.7_0.07_var(--hue))]" />
      <span className="truncate">
        <span className="font-mono text-[oklch(0.76_0.05_var(--hue))]">{note.handle}</span>{' '}
        {VERB[note.kind] ?? 'did something'} {note.detail ?? ''}
      </span>
    </motion.p>
  )
}

/**
 * A one-to-one, docked at the bottom of the column rather than floating over
 * the room. Whispering is a side conversation you are having *while* standing
 * in here, so it belongs in the same column, under everything else.
 */
function Whisper({ thread, onSend, onClose, onOpen }) {
  const [draft, setDraft] = useState('')

  if (thread.unread) {
    return (
      <motion.button
        type="button"
        onClick={onOpen}
        className="mx-3 mb-3 flex cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-[oklch(0.62_0.075_var(--hue)/0.2)] px-3 py-2.5 text-left"
        style={{ '--hue': thread.peer.hue }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <span className="text-[oklch(0.84_0.07_var(--hue))] [&_svg]:size-4">
          <WhisperIcon />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[11px] text-[oklch(0.86_0.07_var(--hue))]">
            {thread.peer.handle}
          </span>
          <span className="block text-[11px] text-graphite">wants a word</span>
        </span>
      </motion.button>
    )
  }

  return (
    <motion.section
      className="mx-3 mb-3 flex-none overflow-hidden rounded-xl bg-[oklch(0.5_0.06_var(--hue)/0.16)]"
      style={{ '--hue': thread.peer.hue }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      aria-label={`Whisper with ${thread.peer.handle}`}
    >
      <header className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <span className="text-[oklch(0.82_0.07_var(--hue))] [&_svg]:size-3.5">
          <WhisperIcon />
        </span>
        <span className="font-mono text-[11.5px] text-[oklch(0.86_0.07_var(--hue))]">
          {thread.peer.handle}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="End this whisper"
          title="End this whisper"
          className="ml-auto grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-graphite transition-colors duration-200 hover:text-paper [&_svg]:size-3.5"
        >
          <CloseIcon />
        </button>
      </header>

      <p className="mx-3 mb-2 font-mono text-[9.5px] leading-relaxed text-[oklch(0.78_0.05_var(--hue))]">
        Just the two of you. Gone when either of you leaves.
      </p>

      <div className="flex max-h-[176px] flex-col gap-1.5 overflow-y-auto px-3 pb-2">
        {thread.messages.length === 0 ? (
          <p className="py-2 text-[11.5px] text-graphite/70">
            They know nothing about you. Say anything.
          </p>
        ) : null}
        {thread.messages.map((m) => (
          <p
            key={m.id}
            className={[
              'max-w-[88%] rounded-xl px-2.5 py-1.5 text-[12px] leading-snug',
              m.mine
                ? 'self-end bg-[oklch(0.62_0.075_var(--hue)/0.3)] text-paper'
                : 'self-start bg-void/45 text-paper/85',
            ].join(' ')}
          >
            {m.text}
          </p>
        ))}
      </div>

      <form
        className="relative px-3 pb-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onSend(draft)
          setDraft('')
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={240}
          placeholder={`Whisper to ${thread.peer.handle}`}
          aria-label={`Whisper to ${thread.peer.handle}`}
          className="inset h-9 w-full rounded-lg pr-9 pl-3 text-[12px] text-paper placeholder:text-pencil focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send whisper"
          className="absolute top-1/2 right-4.5 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-[oklch(0.86_0.07_var(--hue))] disabled:opacity-25 [&_svg]:size-4"
        >
          <SendIcon />
        </button>
      </form>
    </motion.section>
  )
}

/** Saying something to the whole room. */
const Composer = forwardRef(function Composer({ self, onSay, onReact }, ref) {
  const [draft, setDraft] = useState('')

  return (
    <div className="flex-none border-t border-paper/6 p-3">
      <div className="mb-2 flex items-center justify-between gap-1">
        {REACTIONS.map((emoji) => (
          <motion.button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            aria-label={`React ${emoji}`}
            whileHover={{ scale: 1.2, y: -2 }}
            whileTap={{ scale: 0.86 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            className="grid size-8 cursor-pointer place-items-center rounded-lg border-0 bg-transparent p-0 text-[14px] opacity-65 transition-opacity duration-200 hover:bg-paper/5 hover:opacity-100"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onSay(draft)
          setDraft('')
        }}
      >
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={240}
          placeholder={self ? `Say something as ${self.handle}` : 'Say something'}
          aria-label="Say something to the room"
          className="inset h-11 w-full rounded-xl pr-11 pl-3.5 text-[13px] text-paper placeholder:text-pencil focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send"
          whileTap={{ scale: 0.88 }}
          className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg border-0 bg-[oklch(0.62_0.075_var(--hue)/0.3)] p-0 text-paper transition-opacity duration-200 disabled:opacity-30 [&_svg]:size-4"
        >
          <SendIcon />
        </motion.button>
      </form>
    </div>
  )
})
