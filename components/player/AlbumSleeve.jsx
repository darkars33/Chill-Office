import Image from 'next/image'
import { thumbnailUrl } from '@/lib/utils/youtube'

/** Spinning record sleeve. Decorative — the title is announced by the track copy. */
export default function AlbumSleeve({ track, playing }) {
  return (
    <div
      className={[
        'relative size-[58px] overflow-hidden rounded-full wide:size-[72px]',
        'border-2 border-[#fff4e3]/38 bg-[#2a2028]',
        'shadow-[0_6px_20px_rgba(20,7,2,0.4),inset_0_0_0_1px_rgba(0,0,0,0.2)]',
        // the spindle hole
        "after:absolute after:top-1/2 after:left-1/2 after:-mt-1.5 after:-ml-1.5 after:size-3 after:rounded-full after:border after:border-black/40 after:bg-[#1b1218] after:content-['']",
      ].join(' ')}
    >
      {/* The sleeve is 58px (72px on wide screens) but the transform zooms 1.4x to
          crop the letterbox bars, so ask for a little more than the box. Pausing
          the animation rather than dropping it keeps the record where it stopped. */}
      <Image
        src={thumbnailUrl(track.id)}
        alt=""
        fill
        sizes="112px"
        draggable={false}
        className={[
          'block rounded-[inherit] object-cover object-center will-change-transform',
          '[transform:scale(1.4)_rotate(0deg)] animate-sleeve-spin motion-reduce:animate-none',
          playing ? '[animation-play-state:running]' : '[animation-play-state:paused]',
        ].join(' ')}
      />
    </div>
  )
}
