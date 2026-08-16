import Ceiling from '@/components/scene/Ceiling'
import ChaiTable from '@/components/scene/ChaiTable'
import CityView from '@/components/scene/CityView'
import Colleagues from '@/components/scene/Colleagues'
import ColorGrade from '@/components/scene/ColorGrade'
import Couch from '@/components/scene/Couch'
import DeskArea from '@/components/scene/DeskArea'
import DustMotes from '@/components/scene/DustMotes'
import Floor from '@/components/scene/Floor'
import LightShafts from '@/components/scene/LightShafts'
import Plants from '@/components/scene/Plants'
import SceneDefs from '@/components/scene/SceneDefs'
import WallFixtures from '@/components/scene/WallFixtures'
import WindowFrame from '@/components/scene/WindowFrame'

/**
 * Hand-drawn office-at-golden-hour backdrop. Pure inline SVG so the app ships
 * with zero image assets: two colleagues on a couch, sun going down over the
 * city, chai steaming on the side table.
 *
 * SVG has no z-index — order *is* depth, so the sequence below is the painting
 * order back to front. Moving a piece moves it in space.
 */
export default function OfficeScene() {
  return (
    <svg
      className="fixed inset-0 -z-[1] block size-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs />

      {/* room shell */}
      <rect width="1600" height="900" fill="url(#wall)" />

      <CityView />
      <WindowFrame />
      <LightShafts />
      <Ceiling />
      <Floor />
      <DeskArea />
      <WallFixtures />
      <Plants />
      <Colleagues />
      <Couch />
      <ChaiTable />
      <DustMotes />
      <ColorGrade />
    </svg>
  )
}
