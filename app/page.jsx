import WorkspaceScreen from '@/components/office/WorkspaceScreen'

/**
 * Walking in the front door.
 *
 * There is no landing page. The building *is* the product, so `/` drops you
 * straight onto the busiest floor with the music already cued — reading about
 * a room you could be standing in would be a worse introduction than standing
 * in it.
 */
export default function HomePage() {
  return <WorkspaceScreen />
}
