import { redirect } from 'next/navigation'

/**
 * Walking in the front door.
 *
 * The front door is the road: `/` hands straight over to `/drive` so the game
 * is the first thing you see, with the music already cued.
 *
 * The office is not gone — `<WorkspaceScreen />` still runs every room at
 * `/room/<id>`, and the floor plan is still at `/directory`. To put the
 * building back on the doorstep, delete this file's redirect and return
 * `<WorkspaceScreen />` again.
 */
export default function HomePage() {
  redirect('/drive')
}
