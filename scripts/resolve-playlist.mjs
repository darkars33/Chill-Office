// Find a real, embeddable YouTube upload for a song and print a playlist entry
// you can paste into lib/playlist.js.
//
//   node scripts/resolve-playlist.mjs "Chaiyya Chaiyya|Dil Se|1998|Sukhwinder Singh"
//   node scripts/resolve-playlist.mjs "Pehla Nasha|Jo Jeeta Wohi Sikandar|1992|Udit Narayan"
//
// Ranking prefers uploads from the labels that actually own this catalogue
// (Saregama, Shemaroo, T-Series, YRF, Tips, Venus…) and rejects the usual
// search-result noise: covers, remixes, mashups, hour-long jukeboxes.
//
// Runs one request at a time with backoff. It is slow on purpose — hammering
// youtube.com gets you throttled and the results get worse, not faster.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const H = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const OFFICIAL = [
  'shemaroo', 'saregama', 't-series', 'tseries', 'ultra', 'venus', 'tips',
  'yrf', 'yash raj', 'eros', 'zee music', 'sony music', 'rajshri',
  'universal music', 'times music', 'goldmines', 'aditya music', 'wave music',
]

const JUNK =
  /(cover|remix|karaoke|instrumental|dj |mashup|reels?|shorts?|8d|slowed|reverb|lofi|lo-fi|ringtone|whatsapp status|choreograph|tutorial|reaction|flute|piano|guitar (cover|lesson)|full movie|jukebox|non ?stop)/i

const MIN_SECONDS = 120
const MAX_SECONDS = 900

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

async function get(url, tries = 5) {
  let wait = 1200
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { headers: H })
      if (res.ok) {
        const text = await res.text()
        if (text.length > 20000) return text
      }
    } catch {
      /* retry */
    }
    await sleep(wait)
    wait = Math.min(wait * 2, 15000)
  }
  return null
}

// Walk YouTube's ytInitialData blob for every search hit it rendered.
function collectVideos(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const child of node) collectVideos(child, out)
    return out
  }
  if (node.videoRenderer?.videoId) {
    const v = node.videoRenderer
    const title = v.title?.runs?.map((r) => r.text).join('') || v.title?.simpleText || ''
    const channel =
      v.ownerText?.runs?.[0]?.text ||
      v.longBylineText?.runs?.[0]?.text ||
      v.shortBylineText?.runs?.[0]?.text ||
      ''
    const parts = (v.lengthText?.simpleText || '').split(':').map(Number)
    const seconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts.length === 2
          ? parts[0] * 60 + parts[1]
          : 0
    out.push({ id: v.videoId, title, channel, seconds })
  }
  for (const k of Object.keys(node)) collectVideos(node[k], out)
  return out
}

async function search(query) {
  const html = await get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  )
  if (!html) return []
  const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s)
  if (!match) return []
  try {
    const seen = new Set()
    return collectVideos(JSON.parse(match[1])).filter((v) => !seen.has(v.id) && seen.add(v.id))
  } catch {
    return []
  }
}

function score(cand, song) {
  const title = norm(cand.title)
  const channel = cand.channel.toLowerCase()
  let s = 0

  if (JUNK.test(cand.title)) s -= 60

  const tokens = norm(song.title).split(' ').filter((w) => w.length > 2)
  const hits = tokens.filter((w) => title.includes(w)).length
  s += (hits / Math.max(1, tokens.length)) * 50
  if (hits === 0) s -= 40

  if (title.includes(norm(song.film))) s += 16
  if (cand.title.includes(String(song.year))) s += 5
  if (OFFICIAL.some((o) => channel.includes(o))) s += 30
  if (/vevo|official/i.test(cand.channel)) s += 8

  // Full song, not a clip and not a compilation.
  if (cand.seconds >= 150 && cand.seconds <= 540) s += 18
  else if (cand.seconds > 540 && cand.seconds <= 900) s -= 10
  else if (cand.seconds > 900) s -= 70
  else if (cand.seconds > 0) s -= 25

  return s
}

async function probe(id) {
  const html = await get(`https://www.youtube.com/watch?v=${id}`)
  if (!html || !/"playableInEmbed"/.test(html)) return null
  return {
    embeddable: /"playableInEmbed":true/.test(html),
    unplayable: /"status":"(UNPLAYABLE|LOGIN_REQUIRED|ERROR)"/.test(html),
    ageGated: /"isAgeRestricted":true/.test(html),
    seconds: Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1] || 0),
    owner: html.match(/"ownerChannelName":"([^"]+)"/)?.[1] || '',
  }
}

async function oembed(id) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      )
      if (res.ok) return res.json()
      if (res.status === 401 || res.status === 404) return null
    } catch {
      /* retry */
    }
    await sleep(1000)
  }
  return null
}

async function resolve(song) {
  const queries = [
    `${song.title} ${song.film} ${song.year} full song`,
    `${song.title} ${song.film} song ${song.singers}`,
    `${song.title} ${song.film} audio song`,
  ]
  const tried = new Set()

  for (const query of queries) {
    const ranked = (await search(query))
      .map((c) => ({ ...c, s: score(c, song) }))
      .filter((c) => c.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)

    for (const cand of ranked) {
      if (tried.has(cand.id)) continue
      tried.add(cand.id)

      const info = await probe(cand.id)
      await sleep(600)
      if (!info || !info.embeddable || info.unplayable || info.ageGated) continue
      if (info.seconds < MIN_SECONDS || info.seconds > MAX_SECONDS) continue

      const meta = await oembed(cand.id)
      if (!meta) continue

      return {
        id: cand.id,
        seconds: info.seconds,
        ytTitle: meta.title,
        channel: meta.author_name || info.owner,
      }
    }
    await sleep(800)
  }
  return null
}

const arg = process.argv[2]
if (!arg || !arg.includes('|')) {
  console.error('usage: node scripts/resolve-playlist.mjs "Title|Film|Year|Singers"')
  process.exit(2)
}

const [title, film, year, singers = ''] = arg.split('|').map((s) => s.trim())
const song = { title, film, year: Number(year), singers }

console.error(`searching for “${title}” — ${film} (${year})…`)
const found = await resolve(song)

if (!found) {
  console.error('\nNothing usable found. Try a different spelling, or name the singer.')
  process.exit(1)
}

console.error(`\nmatched: ${found.ytTitle}`)
console.error(`channel: ${found.channel}`)
console.error(
  `runtime: ${Math.floor(found.seconds / 60)}:${String(found.seconds % 60).padStart(2, '0')}`,
)
console.error('\nverified public and embeddable. Paste into lib/playlist.js:\n')

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
console.log(`  {
    id: '${found.id}',
    title: '${esc(title)}',
    film: '${esc(film)}',
    year: ${song.year},
    singers: '${esc(singers)}',
    seconds: ${found.seconds},
  },`)
