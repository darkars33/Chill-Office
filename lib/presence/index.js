/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  THE PRESENCE SEAM                                                       │
 * │                                                                          │
 * │  Everything the interface knows about other people goes through the      │
 * │  client returned here: who is on the floor, where they are standing,     │
 * │  what they said, what they reacted to, whether a whisper is open.        │
 * │                                                                          │
 * │  There is no server. The only implementation today is a LOCAL SIMULATION │
 * │  — the people are generated in this tab and nobody else can see them.    │
 * │  It exists so the product can be designed and reviewed end to end.       │
 * │                                                                          │
 * │  While the simulation is active the UI shows a persistent SIMULATED      │
 * │  badge. That badge is driven by `IS_SIMULATED` and must stay visible for │
 * │  as long as the people on screen are not real.                           │
 * │                                                                          │
 * │  To make it real, write another module with the same shape — a WebSocket │
 * │  room, Supabase Realtime, PartyKit, Liveblocks — and swap the import.    │
 * │  Nothing above this file needs to change.                                │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * The contract:
 *
 *   const client = createPresenceClient({ room, self })
 *   client.subscribe(state => …)  → unsubscribe
 *   client.say(text)
 *   client.react(emoji)
 *   client.openWhisper(peerId) / sendWhisper(peerId, text) / closeWhisper(peerId)
 *   client.destroy()
 *
 * State handed to subscribers:
 *
 *   {
 *     total,                     // everyone in the room, including unrendered
 *     people[],                  // { id, handle, hue, tint, seed, spot: {x, depth},
 *                                //   seated, away, idle, joinedAt, lastSpokeAt }
 *     messages[],                // { id, authorId, handle, hue, seed, text, at, mine }
 *     reactions[],               // { id, emoji, at, authorId }
 *     activity[],                // { id, kind: join|leave|react, handle, detail, at }
 *     whispers{}                 // peerId → { peer, messages[], unread, openedAt }
 *   }
 */
export { createPresenceClient, IS_SIMULATED } from '@/lib/presence/simulated'

/**
 * How many people the floor draws before it starts summarising.
 *
 * Lower than you might expect, and deliberately so: these are figures standing
 * in a room, not dots. Past roughly two dozen the floor stops reading as a
 * space with people in it and starts reading as a crowd texture, and the
 * remainder is better communicated by the headcount than by more bodies.
 */
export const RENDERED_PEOPLE_CAP = 22

/** How long a line stays in the conversation column, in ms. */
export const MESSAGE_TTL = 90000

/** How long a line floats over the speaker's head on the floor, in ms. */
export const BUBBLE_TTL = 8000

/** How long after arriving somebody still reads as "just joined", in ms. */
export const JUST_JOINED_MS = 14000
