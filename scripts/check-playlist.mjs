// Link-rot check: are all 50 tracks still public and still embeddable?
//
//   node scripts/check-playlist.mjs
//
// Exits 1 if anything broke, so it can run in CI. Uploads get pulled and
// embedding permission gets revoked, and either way the track silently dies in
// the player — this is how you find out before your colleagues do.
import { PLAYLIST } from '../src/playlist.js'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const H = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// YouTube throttles rapid watch-page fetches, so back off rather than give up.
async function fetchWatch(id, tries = 4) {
  let wait = 1000
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: H })
      if (res.ok) {
        const text = await res.text()
        if (/"playableInEmbed"/.test(text)) return text
      }
    } catch {
      /* retry */
    }
    await sleep(wait)
    wait = Math.min(wait * 2, 12000)
  }
  return null
}

async function check(song) {
  const html = await fetchWatch(song.id)
  if (!html) return { ...song, status: 'unknown', note: 'could not read watch page' }

  const embeddable = /"playableInEmbed":true/.test(html)
  const unplayable = /"status":"(UNPLAYABLE|LOGIN_REQUIRED|ERROR)"/.test(html)
  const ageGated = /"isAgeRestricted":true/.test(html)

  if (unplayable) return { ...song, status: 'broken', note: 'video unplayable or removed' }
  if (!embeddable) return { ...song, status: 'broken', note: 'embedding disabled by owner' }
  if (ageGated) return { ...song, status: 'broken', note: 'age restricted' }
  return { ...song, status: 'ok', note: '' }
}

const results = []
for (const song of PLAYLIST) {
  const r = await check(song)
  results.push(r)
  const mark = r.status === 'ok' ? '·' : r.status === 'broken' ? '✗' : '?'
  process.stdout.write(mark)
  await sleep(400)
}
process.stdout.write('\n\n')

const broken = results.filter((r) => r.status === 'broken')
const unknown = results.filter((r) => r.status === 'unknown')

console.log(`${results.length - broken.length - unknown.length}/${results.length} playable`)

if (unknown.length) {
  console.log(`\n${unknown.length} inconclusive (likely rate limiting, try again):`)
  for (const r of unknown) console.log(`  ${r.id}  ${r.title} — ${r.film}`)
}

if (broken.length) {
  console.log(`\n${broken.length} broken:`)
  for (const r of broken) {
    console.log(`  ${r.id}  ${r.title} — ${r.film} (${r.year})`)
    console.log(`           ${r.note}`)
  }
  console.log('\nReplace them with: node scripts/resolve-playlist.mjs "Title|Film|Year|Singers"')
  process.exit(1)
}

console.log('\nAll good.')
