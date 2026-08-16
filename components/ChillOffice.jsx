'use client'

import DeskClock from '@/components/chrome/DeskClock'
import NowPlayingBadge from '@/components/chrome/NowPlayingBadge'
import TopLinks from '@/components/chrome/TopLinks'
import PlayerBar from '@/components/player/PlayerBar'
import YouTubeHost from '@/components/player/YouTubeHost'
import QueueDrawer from '@/components/queue/QueueDrawer'
import QueueScrim from '@/components/queue/QueueScrim'
import OfficeScene from '@/components/scene/OfficeScene'
import ScreenReaderHint from '@/components/ui/ScreenReaderHint'
import Toast from '@/components/ui/Toast'
import { useChillOffice } from '@/hooks/useChillOffice'

/**
 * The app shell. All state lives in `useChillOffice`; this file is only the
 * arrangement of pieces on top of the scene.
 */
export default function ChillOffice() {
  const {
    playlist,
    queue,
    player,
    track,
    toast,
    brokenIds,
    queueOpen,
    openQueue,
    closeQueue,
    skip,
    jumpTo,
    toggleShuffle,
    toggleMute,
  } = useChillOffice()

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-ink">
      <OfficeScene />

      <DeskClock />

      <NowPlayingBadge track={track} playing={player.playing} />

      <TopLinks
        track={track}
        queueCount={playlist.length}
        queueOpen={queueOpen}
        muted={player.muted}
        onOpenQueue={openQueue}
        onToggleMute={toggleMute}
      />

      <YouTubeHost hostRef={player.hostRef} />

      <PlayerBar
        track={track}
        position={queue.position}
        shuffle={queue.shuffle}
        playing={player.playing}
        ready={player.ready}
        buffering={player.buffering}
        time={player.time}
        duration={player.duration}
        onSeek={player.seek}
        onToggle={player.toggle}
        onNext={() => skip(1)}
        onPrevious={() => skip(-1)}
        onToggleShuffle={toggleShuffle}
      />

      <Toast message={toast} />

      <QueueScrim open={queueOpen} onClick={closeQueue} />

      <QueueDrawer
        open={queueOpen}
        playlist={playlist}
        order={queue.order}
        pointer={queue.pointer}
        shuffle={queue.shuffle}
        playing={player.playing}
        brokenIds={brokenIds}
        onClose={closeQueue}
        onSelect={jumpTo}
      />

      <ScreenReaderHint />
    </main>
  )
}
