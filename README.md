# Chill Office

A single-screen music room for the end of the workday: the office at golden hour,
two colleagues on the couch, chai going cold on the side table, and 50 Hindi-film
classics from the 70s, 80s and 90s on rotation.

Built in the spirit of [Tapri Tapes](https://chai-tapri-wala.vercel.app/), moved
indoors.

```bash
npm install
npm run dev      # http://localhost:5173
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
full list is in [`src/playlist.js`](src/playlist.js).

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
paste into `src/playlist.js`. Use the same command to add songs.

Both scripts talk to youtube.com one request at a time with backoff. They are
slow on purpose — going faster gets you throttled and the results get worse.

## Using your own audio files

If you have licensed files, or a locked-down network, swap the YouTube player for
an `<audio>` element:

1. Put the files in `public/audio/`.
2. Add a `src` to each entry in `src/playlist.js` (`src: '/audio/track.mp3'`).
3. Replace `useYouTubePlayer.js` with a hook wrapping one `HTMLAudioElement`.
   It needs to expose the same shape the UI already consumes — `playing`,
   `time`, `duration`, `play`, `pause`, `toggle`, `seek`, `nudge`, `toggleMute`
   — so `App.jsx` keeps working. Point `.sleeve img` at your own artwork.

Nothing else has to change.

## Deploying

Zero-config on Vercel — it detects Vite, builds with `npm run build`, serves
`dist/`.

```bash
npm i -g vercel && vercel
```

The YouTube embed reports the deployed origin, so it works on any host without
setup. One thing worth deciding before you share the link: playback is per
visitor, so two colleagues on the same page hear the same playlist from
different positions. It is a shared room, not a synchronised one.

## How it works

| File | Role |
|---|---|
| [`src/App.jsx`](src/App.jsx) | Queue order, shuffle, keyboard shortcuts, all UI |
| [`src/useYouTubePlayer.js`](src/useYouTubePlayer.js) | Wraps the IFrame API: load, play, seek, error recovery |
| [`src/OfficeScene.jsx`](src/OfficeScene.jsx) | The background, hand-drawn as inline SVG |
| [`src/playlist.js`](src/playlist.js) | The 50 tracks |
| [`src/styles.css`](src/styles.css) | Everything visual, including the scene's animation |

A few decisions that are easy to undo by accident:

- **The YouTube iframe is parked off-screen** at `left: -10000px`, not hidden
  with `display: none`. Hiding it stops playback, so it has to stay laid out.
- **The player is constructed with its first `videoId` already set.** Built empty
  it can sit there without ever firing `onReady`, leaving a spinner forever.
- **The colleagues are drawn before the couch**, so the backrest crops them at
  the shoulders. Reordering those two groups makes them float in front of it.
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
