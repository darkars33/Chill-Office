import { notFound } from 'next/navigation'
import WorkspaceScreen from '@/components/office/WorkspaceScreen'
import { areaById } from '@/lib/areas'
import { ROOMS, roomById } from '@/lib/rooms'

/** Every song is a room and the set is fixed, so prerender all of them. */
export function generateStaticParams() {
  return ROOMS.map((room) => ({ id: room.id }))
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const room = roomById(id)
  if (!room) return {}

  return {
    title: `${room.track.title} — ${areaById(room.areaId).name}`,
    description: `A room on the ${areaById(room.areaId).name}. Everyone in it is hearing “${room.track.title}” at the same second.`,
  }
}

export default async function RoomPage({ params }) {
  const { id } = await params
  if (!roomById(id)) notFound()

  return <WorkspaceScreen roomId={id} />
}
