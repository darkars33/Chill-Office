# Chill Office

A single-screen music room for the end of the workday: the office at golden hour,
two colleagues on the couch, chai going cold on the side table, and 50 Hindi-film
classics from the 70s, 80s and 90s on rotation.

Built in the spirit of [Tapri Tapes](https://chai-tapri-wala.vercel.app/), moved
indoors.

Built with Next.js (App Router), React and Tailwind CSS. `next dev` and
`next build` both run on Turbopack, which is the default bundler in Next.js 16 —
no flag needed.

```bash
npm install
npm run dev      # http://localhost:3000
```

## About the music

**The songs are not downloaded, and they are not stored in this repo.** All 50
tracks stream from YouTube through its official IFrame Player, which is the same
approach the original site takes. The app holds a list of video IDs; YouTube does
the serving.

That is deliberate. Ripping 50 Bollywood songs to MP3 would mean redistributing
music owned by Saregama, T-Series, YRF, Tips and others, which is not something
you want sitting in a repo — let alone deployed on a company URL. Streaming the
rights-holders' own uploads keeps the plays legitimate and the artists in the
payout loop.

Practical consequences worth knowing:

- **Playback needs a network connection**, and it needs YouTube to be reachable.
  On a locked-down corporate network that blocks `youtube.com` or
  `googlevideo.com`, nothing will play.
- **The first play has to be a click.** Browsers block autoplay with sound, so
  the player loads paused. This is not a bug.
- **Uploads can vanish.** Videos get deleted and embed permission gets revoked.
  See [Keeping the playlist alive](#keeping-the-playlist-alive).

If you would rather play files you own, see [Using your own audio
files](#using-your-own-audio-files).

### How the 50 were chosen

Each entry was resolved by searching YouTube and then verified three ways: the
video exists, it is public, and its owner allows embedding (`playableInEmbed`).
Ranking preferred uploads from the labels that actually own this catalogue, and
rejected covers, remixes, mashups and hour-long jukeboxes.

Then the list was read by hand, which caught things the score did not — a search
for *Bachna Ae Haseeno* resolving to the 2008 Ranbir Kapoor remake instead of
Kishore's 1977 original, a *Raja Hindustani* query landing on a song from a
different film entirely, and a 14-minute mashup masquerading as a single.

Where it landed:

| | |
|---|---|
| 1970s | 20 tracks |
| 1980s | 12 tracks |
| 1990s | 18 tracks |
| From label channels | 42 of 50 |

Kishore Kumar, Rafi, Lata, Asha, Mukesh, Kumar Sanu, Udit Narayan, Alka Yagnik,
S. P. Balasubrahmanyam; R.D. Burman through Bappi Lahiri to A. R. Rahman. The
full list is in [`lib/playlist.js`](lib/playlist.js).

## Controls

| Key | Does |
|---|---|
| `Space` | Play / pause |
| `←` `→` | Seek 5 seconds |
| `Shift` + `←` `→` | Previous / next track |
| `S` | Shuffle |
| `M` | Mute |
| `Q` | Open the queue |
| `Esc` | Close the queue |

Clicking any row in the queue jumps straight to that track.

## Keeping the playlist alive

```bash
npm run check:playlist
```

Re-tests all 50 video IDs and reports anything that has been removed, had
embedding disabled, or become age-restricted. Exits non-zero if something broke,
so it can run on a schedule.

To find a replacement:

```bash
node scripts/resolve-playlist.mjs "Chaiyya Chaiyya|Dil Se|1998|Sukhwinder Singh"
```

It searches, verifies the result is embeddable, and prints an entry ready to
paste into `lib/playlist.js`. Use the same command to add songs.

Both scripts talk to youtube.com one request at a time with backoff. They are
slow on purpose — going faster gets you throttled and the results get worse.

## Using your own audio files

If you have licensed files, or a locked-down network, swap the YouTube player for
an `<audio>` element:

1. Put the files in `public/audio/`.
2. Add a `src` to each entry in `lib/playlist.js` (`src: '/audio/track.mp3'`).
3. Replace `hooks/useYouTubePlayer.js` with a hook wrapping one
   `HTMLAudioElement`. It needs to expose the same shape the UI already consumes
   — `playing`, `time`, `duration`, `play`, `pause`, `toggle`, `seek`, `nudge`,
   `toggleMute` — so `useChillOffice` keeps working. Point `AlbumSleeve` at your
   own artwork.

Nothing else has to change.

## Deploying

Zero-config on Vercel — it detects Next.js and builds with `npm run build`.

```bash
npm i -g vercel && vercel
```

The YouTube embed reports the deployed origin, so it works on any host without
setup. One thing worth deciding before you share the link: playback is per
visitor, so two colleagues on the same page hear the same playlist from
different positions. It is a shared room, not a synchronised one.

## How it works

```
app/                      App Router entry
  layout.jsx              <html>, metadata, preconnects
  page.jsx                server component, renders the shell
  globals.css             Tailwind entry: theme tokens, keyframes, seek-bar utility
components/
  ChillOffice.jsx         'use client' shell — arrangement only, no logic
  chrome/                 desk clock, now-playing badge, top links
  player/                 player pill, sleeve, seek bar, transport, iframe host
  queue/                  playlist drawer, rows, scrim
  scene/                  the backdrop, one component per layer
  ui/                     icons, toast, screen-reader hint
hooks/
  useChillOffice.js       composes everything below into one view model
  usePlaybackQueue.js     play order, pointer, shuffle
  useYouTubePlayer.js     wraps the IFrame API: load, play, seek, error recovery
  useKeyboardShortcuts.js global key bindings
  useClock.js             ticking desk clock
  useToast.js             transient status line
lib/
  playlist.js             the 50 tracks
  constants.js            timings, sizes, error codes
  scene-geometry.js       generated positions for dust motes and city windows
  utils/                  time formatting, shuffle, YouTube URLs, DOM helpers
scripts/                  playlist verification tools (plain Node)
postcss.config.mjs        Tailwind's PostCSS plugin, picked up by Turbopack
```

Styling is Tailwind utilities in the components. `app/globals.css` holds only
what utilities cannot express: the palette and font tokens, the two extra
breakpoints (`pill` at 561px and `wide` at 701px, where the player pill reflows),
every `@keyframes` used by the scene, and the `seek-range` utility for the range
input's vendor pseudo-elements.

State lives in `hooks/`, markup lives in `components/`. The only components
carrying `'use client'` are the ones that own state or touch the DOM —
`ChillOffice`, `DeskClock` and `TrackPanel`.

A few decisions that are easy to undo by accident:

- **The YouTube iframe is parked off-screen** at `left: -10000px`, not hidden
  with `display: none`. Hiding it stops playback, so it has to stay laid out.
- **The player is constructed with its first `videoId` already set.** Built empty
  it can sit there without ever firing `onReady`, leaving a spinner forever.
- **`<Colleagues />` renders before `<Couch />`**, so the backrest crops them at
  the shoulders. SVG has no z-index — reordering those two makes the colleagues
  float in front of the couch.
- **The desk clock renders nothing until it mounts.** The server has no idea what
  time it is where the visitor is, so rendering a time server-side would hydrate
  mismatched.
- **The record sleeve is `scale(1.4)`.** YouTube thumbnails are 16:9 with
  letterbox bars; without the scale you see the bars inside the circle.
- Tracks YouTube refuses are marked with `⚠` in the queue and skipped
  automatically, with a guard so an entirely dead queue does not loop forever.

The scene ships as SVG rather than an image: no downloaded assets, no licensing
question, sharp at any size, and the steam, dust, flickering city windows and
swaying pendant lamps are all CSS. It all collapses under
`prefers-reduced-motion`.

## Credit

Songs belong to their composers, singers, lyricists and labels. This is a player
pointed at their own uploads, nothing more.
