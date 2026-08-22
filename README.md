# Open Floor

A digital office where everybody is anonymously listening to music.

You walk in and you are standing on a floor with other people on it — figures at
different distances, headphones on, name plates under them, one of them saying
something across the room. In the middle is the record everybody is hearing. Down
the hall are four more floors with their own crowds.

Nobody has an account. Nobody has a name. Nothing anybody says is kept.

```bash
npm install
npm run dev      # http://localhost:3000
```

Next.js (App Router), React, Tailwind CSS v4 and Motion. `next dev` and
`next build` both run on Turbopack, the default bundler in Next.js 16.

---

## ⚠ Read this first: the people are not real yet

**There is no realtime backend.** Every person, message, reaction and movement in
the building is generated locally in your own browser tab. Nobody else can see
them, and they cannot see you.

That simulation lives in exactly one file — [`lib/presence/simulated.js`](lib/presence/simulated.js)
— behind the seam documented in [`lib/presence/index.js`](lib/presence/index.js).
Everything else talks to that seam and nothing else, so swapping in a real
transport (a WebSocket room, Supabase Realtime, PartyKit, Liveblocks) is one
module, not a rewrite:

```js
const client = createPresenceClient({ room, self })
client.subscribe(state => …)   // { total, people[], messages[], reactions[], activity[], whispers{} }
client.say(text)
client.react(emoji)
client.openWhisper(peerId) / sendWhisper(peerId, text) / closeWhisper(peerId)
client.destroy()
```

While the simulation is the implementation, `IS_SIMULATED` is `true` and every
screen shows a **SIMULATED** badge. **Do not clear that flag while this is still
the implementation.** Showing invented people to a real person as though they
were in the room is the product telling a lie, not a placeholder. Replace the
module; do not un-flag it.

## The building

| | |
|---|---|
| **Listening Room** | The main floor. Headphones on, nobody talking much. |
| **The Lounge** | Sofas, chatter, somebody always has an opinion. |
| **Quiet Room** | Small rooms with the door shut. Two or three people, tops. |
| **Late Night** | The long ones. Lights down, nobody leaving. |
| **Trending Floor** | Wherever the crowd went. Loud, full, hard to hear yourself. |

A song *is* a room, and every room stands on one of those floors — derived from
the track's own length, decade and crowd in [`lib/areas.js`](lib/areas.js), so the
plan is fixed and you can learn your way around.

| Route | What it is |
|---|---|
| `/` | The floor you walked in on. No landing page; the building is the product. |
| `/room/[id]` | The same workspace, standing in that room |
| `/directory` | The whole building: five floors, fifty doorways |

Playback lives above the router in [`providers/`](providers), so walking out to
the directory and back never interrupts the music.

## How the room is built

The depth illusion is the whole design, and it comes from one number.

Everything standing on the floor has an `(x, depth)` spot. `depth` runs 0 at the
back wall to 1 at the near edge, and it drives four things at once — vertical
position, scale, haze, and paint order. That is why somebody at the front walks
*in front of* the album art and the couch, and why a flat `<div>` reads as a room.
It all lives in [`lib/floor-space.js`](lib/floor-space.js), shared by the people
and the furniture so neither has to know about the other.

- **People** ([`Floor.jsx`](components/office/Floor.jsx)) are positioned by a
  single `requestAnimationFrame` loop that eases each figure toward its target,
  so they walk rather than teleport. Motion only handles arrival and departure.
- **Figures** ([`Persona.jsx`](components/office/Persona.jsx)) are silhouettes
  with no faces — anonymity has to survive being depicted. What varies is
  posture, hair, headphones, and whether they brought a mug or a laptop.
- **Furniture** ([`Props.jsx`](components/office/Props.jsx)) is hand-placed in
  the same depth space. Desks at the back, couch at the front, plants in the
  corners.
- **Everything scales to the stage** via `fitFor()`, so a phone gets a small
  room rather than a cropped one.

## Colour

Warm charcoal, wood and paper. The accents are deliberately low chroma
(`ACCENT_CHROMA = 0.075` in [`lib/palette.js`](lib/palette.js)) and restricted to
four bands — clay, brass, moss, dusty slate blue. The same hue at 0.18 is neon
and at 0.075 is a paint chip; that one number is the difference between a room
and a dashboard.

The room's hue is a registered `@property`, so it *interpolates* — one CSS
transition warms or cools the entire floor as you walk into another space.

## Controls

| Key | Does |
|---|---|
| `Space` | Play / pause |
| `←` `→` | Seek 5 seconds |
| `Shift` + `←` `→` | Previous / next room |
| `/` | Say something to the room |
| `R` | Walk somewhere else |
| `D` | Open the directory |
| `Q` | Queue |
| `Esc` | Close whatever is open |

Hovering somebody stops them and opens their card. Clicking any handle — on the
floor or in the conversation — starts a whisper.

---

## About the music

**The songs are not downloaded, and they are not stored in this repo.** All 50
tracks stream from YouTube through its official IFrame Player. The app holds a
list of video IDs; YouTube does the serving.

That is deliberate. Ripping 50 Bollywood songs to MP3 would mean redistributing
music owned by Saregama, T-Series, YRF, Tips and others. Streaming the
rights-holders' own uploads keeps the plays legitimate and the artists in the
payout loop.

- **Playback needs a network connection** and needs YouTube to be reachable.
- **The first play has to be a click.** Browsers block autoplay with sound.
- **Uploads can vanish.** See below.

Each entry was resolved by searching YouTube and verified three ways: the video
exists, it is public, and its owner allows embedding. Ranking preferred label
uploads and rejected covers, remixes and hour-long jukeboxes; the list was then
read by hand, which caught a *Bachna Ae Haseeno* resolving to the 2008 remake and
a 14-minute mashup masquerading as a single. Full list in
[`lib/playlist.js`](lib/playlist.js).

```bash
npm run check:playlist                                       # re-test all 50
node scripts/resolve-playlist.mjs "Chaiyya Chaiyya|Dil Se|1998|Sukhwinder Singh"
```

Both scripts talk to youtube.com one request at a time with backoff. They are
slow on purpose.

## Deploying

Zero-config on Vercel. The YouTube embed reports the deployed origin, so it works
on any host without setup.

Playback is per visitor: two people in the same room hear the same track from
different positions. Making a room genuinely synchronised is part of the same job
as making presence real.

## Layout

```
app/
  layout.jsx            <html>, metadata, <Providers>
  globals.css           the design system: warm tokens, the four surfaces, @property --hue
  page.jsx              the floor you walk in on
  room/[id]/page.jsx    one prerendered page per room
  directory/page.jsx    the building
providers/              session (identity) · player (the tuner) · presence
components/office/
  WorkspaceScreen.jsx   the three columns and the desk
  RoomStage.jsx         wall, floor, station, lighting
  Floor.jsx             people standing on it
  Persona.jsx Props.jsx PersonCard.jsx
  NavRail.jsx ActivityColumn.jsx MusicDesk.jsx
  QueuePanel.jsx MyDeskPanel.jsx DirectoryScreen.jsx
lib/
  presence/             ⚠ the seam, and the local simulation behind it
  areas.js rooms.js floor-space.js identity.js palette.js seed.js
  playlist.js constants.js utils/
```

A few decisions that are easy to undo by accident:

- **`<body>` has no background.** `html` carries it. A second opaque background
  there paints as an ordinary box and buries the ambient light behind it. That
  bug shipped once already.
- **The station sits at the same z-index the floor gives mid-depth**, so people
  walk in front of it. Remove that overlap and the album art immediately reads as
  a UI card pinned over a picture.
- **`findSpot` enforces a minimum gap between people.** Every figure carries a
  name plate, and two plates on top of each other turns a room back into noise.
- **People are seeded as already-here on arrival.** Without it the entire floor
  reads "Just joined" for the first fifteen seconds of every visit.
- **The YouTube iframe is parked off-screen** at `left: -10000px`, not hidden
  with `display: none`. Hiding it stops playback.
- **Nothing hard-blinks.** Every repeating animation eases between two values
  over seconds. A `step-end` keyframe reads as a fault, not as life.
- **The artwork is `scale(1.34)`.** YouTube's `hqdefault` is 480×360 with
  letterbox bars; 1.34 is exactly the zoom that pushes them out of a square crop.

Everything collapses under `prefers-reduced-motion`.

## Credit

Songs belong to their composers, singers, lyricists and labels. This is a player
pointed at their own uploads, nothing more.
