import Image from 'next/image'
import { thumbnailUrl } from '@/lib/utils/youtube'

/** Spinning record sleeve. Decorative — the title is announced by the track copy. */
export default function AlbumSleeve({ track, playing }) {
  return (
    <div className={playing ? 'sleeve is-playing' : 'sleeve'}>
      {/* The sleeve is 72px (58px on mobile) but CSS zooms 1.4x to crop the
          letterbox bars, so ask for a little more than the box. */}
      <Image src={thumbnailUrl(track.id)} alt="" fill sizes="112px" draggable={false} />
    </div>
  )
}
