'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import Persona from '@/components/office/Persona'
import {
  ActivityIcon,
  CompassIcon,
  DeskIcon,
  LoungeIcon,
  RoomsIcon,
  WanderIcon,
} from '@/components/ui/Icons'
import { SimulatedBadge } from '@/components/ui/Presence'
import { PRODUCT_NAME } from '@/lib/constants'
import { AREAS } from '@/lib/areas'
import { formatCount } from '@/lib/rooms'

const NAV = [
  { id: 'workspace', label: 'Workspace', href: '/', Icon: RoomsIcon },
  { id: 'rooms', label: 'Rooms', href: '/directory', Icon: CompassIcon },
  { id: 'lounge', label: 'Lounge', href: '/directory#lounge', Icon: LoungeIcon },
]

/**
 * The way around the building.
 *
 * Reads as a directory board rather than as app navigation: the sections are
 * places, the current floor is named, and underneath it the other rooms in the
 * same area are listed the way a "you are here" sign lists what is down the
 * hall. Somebody should be able to tell where they are standing without reading
 * the main panel at all.
 */
export default function NavRail({
  self,
  area,
  neighbours,
  counts,
  currentId,
  activityOpen,
  onEnter,
  onWander,
  onOpenDesk,
  onToggleActivity,
}) {
  return (
    <nav
      className="panel relative z-30 hidden w-[236px] shrink-0 flex-col rounded-2xl lg:flex"
      aria-label="The office"
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <span className="grid size-7 place-items-center rounded-md bg-[oklch(0.62_0.075_var(--hue)/0.3)]">
          <span className="size-1.5 rounded-full bg-[oklch(0.86_0.08_var(--hue))]" />
        </span>
        <span className="plate text-paper/85">{PRODUCT_NAME}</span>
      </div>

      <button
        type="button"
        onClick={onOpenDesk}
        className="mx-3 mb-3 flex cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent p-2 text-left transition-colors duration-200 hover:bg-paper/5"
      >
        <span
          className="inset grid size-10 flex-none place-items-end justify-items-center overflow-hidden rounded-lg"
          style={self ? { '--hue': self.hue } : undefined}
        >
          {self ? (
            <span className="text-[oklch(0.55_0.06_var(--hue))]">
              <Persona seed={self.seed} seated className="h-8" />
            </span>
          ) : null}
        </span>
        <span className="min-w-0">
          <span className="plate block text-[8.5px] text-pencil">My desk</span>
          <span className="mt-0.5 block truncate font-mono text-[12px] text-paper/88">
            {self ? self.handle : '···'}
          </span>
        </span>
        <span className="ml-auto flex-none text-pencil [&_svg]:size-4">
          <DeskIcon />
        </span>
      </button>

      <ul className="mb-2 flex list-none flex-col gap-0.5 px-2">
        {NAV.map(({ id, label, href, Icon }) => (
          <li key={id}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-chalk no-underline transition-colors duration-200 hover:bg-paper/5 hover:text-paper [&_svg]:size-[17px]"
            >
              <Icon />
              {label}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onToggleActivity}
            aria-pressed={activityOpen}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-[13px] transition-colors duration-200 hover:bg-paper/5 [&_svg]:size-[17px] ${
              activityOpen ? 'text-paper' : 'text-chalk'
            }`}
          >
            <ActivityIcon />
            Activity
          </button>
        </li>
      </ul>

      <div className="mx-3 h-px bg-paper/6" />

      {/* Where you are, and what is next door. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className="plate text-pencil">You are in</p>
        <p className="mt-1.5 text-[14px] font-semibold text-paper">{area.name}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-graphite">{area.blurb}</p>

        <p className="plate mt-5 text-pencil">Down the hall</p>
        <ul className="mt-2 flex list-none flex-col">
          {neighbours.map((room) => (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onEnter(room.id)}
                aria-current={room.id === currentId ? 'true' : undefined}
                className="group flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-2 text-left transition-colors duration-200 hover:bg-paper/5"
                style={{ '--hue': room.hue }}
              >
                <span className="size-1.5 flex-none rounded-full bg-[oklch(0.74_0.08_var(--hue))]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-paper/85 group-hover:text-paper">
                    {room.track.title}
                  </span>
                </span>
                <span className="flex-none font-mono text-[10.5px] text-pencil tabular-nums">
                  {formatCount(counts[room.id] ?? room.listeners)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="plate mt-5 text-pencil">Other floors</p>
        <ul className="mt-2 flex list-none flex-col gap-0.5">
          {AREAS.filter((a) => a.id !== area.id).map((other) => (
            <li key={other.id}>
              <Link
                href={`/directory#${other.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-graphite no-underline transition-colors duration-200 hover:bg-paper/5 hover:text-paper"
                style={{ '--hue': other.hue }}
              >
                <span className="size-1.5 flex-none rounded-full bg-[oklch(0.7_0.08_var(--hue))]" />
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-paper/6 p-3">
        <motion.button
          type="button"
          onClick={onWander}
          whileTap={{ scale: 0.97 }}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-paper/8 py-2.5 text-[12.5px] font-semibold text-paper transition-colors duration-200 hover:bg-paper/14 [&_svg]:size-4"
        >
          <WanderIcon />
          Walk somewhere else
        </motion.button>
        <div className="mt-2.5 flex justify-center">
          <SimulatedBadge />
        </div>
      </div>
    </nav>
  )
}
