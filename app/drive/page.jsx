'use client'

import CarGame from '@/components/game/CarGame'
import MusicWidget from '@/components/game/MusicWidget'
import { areaById } from '@/lib/areas'
import { usePlayer } from '@/providers/PlayerProvider'

/**
 * The drive.
 *
 * The game takes the whole screen and the stereo sits in the top corner over
 * it. Nothing here is new state — it is the same tuner the rest of the app is
 * listening to, so the track playing on the road is the track playing in the
 * room. Because `<PlayerProvider>` lives above the router, walking in and out
 * of `/drive` never interrupts it.
 */
export default function DrivePage() {
  const { track, room, player, next, previous } = usePlayer()
  const area = areaById(room.areaId)

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <CarGame
        /* ── YOUR TRACK DATA + AUDIO STATE ──
           The game only needs these three: `id` seeds the simulated tempo, and
           `playing`/`time` drive the beat the world reacts to. */
        track={track}
        playing={player.playing}
        time={player.time}
      />

      {/* The stereo. Same props `<MusicDesk />` takes, so it is wired from the
          same `usePlayer()` values with no adapter in between. */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <MusicWidget
          track={track}
          area={area}
          playing={player.playing}
          ready={player.ready}
          buffering={player.buffering}
          muted={player.muted}
          time={player.time}
          duration={player.duration || track.seconds}
          onSeek={player.seek}
          onToggle={player.toggle}
          onNext={next}
          onPrevious={previous}
          onToggleMute={player.toggleMute}
        />
      </div>
    </main>
  )
}
