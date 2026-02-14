/**
 * Seed Redis with 5 test users and 5 decks each.
 *
 * Usage: npx tsx scripts/seed-redis.ts [--flush]
 *   --flush  Wipe all existing Redis data before seeding
 */

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Redis from 'ioredis'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Types ────────────────────────────────────────────────────────────────────

type RawCryptCard = {
  id: number
  name: string
  clans: string[]
  capacity: number
  disciplines: string[]
  group: number
}

type RawLibraryCard = {
  id: number
  name: string
  types: string[]
  disciplines?: string[]
  clans?: string[]
}

type DeckCardEntry = { cardId: string; count: number }

type Deck = {
  id: string
  userId: string
  name: string
  description: string
  crypt: DeckCardEntry[]
  library: DeckCardEntry[]
  createdAt: string
  updatedAt: string
}

type User = {
  id: string
  name: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dataDir = resolve(__dirname, '..', 'src', 'data')
const crypt: RawCryptCard[] = JSON.parse(readFileSync(resolve(dataDir, 'crypt.json'), 'utf-8'))
const library: RawLibraryCard[] = JSON.parse(readFileSync(resolve(dataDir, 'library.json'), 'utf-8'))

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickRandom = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n)

// ─── Deck building ───────────────────────────────────────────────────────────

/** Find the best consecutive group pair for a clan (the pair with the most vampires). */
const bestGroupPair = (clan: string): [number, number] => {
  const ofClan = crypt.filter((c) => c.clans.includes(clan))
  const groups = [...new Set(ofClan.map((c) => c.group))].sort((a, b) => a - b)

  let best: [number, number] = [groups[0], groups[0]]
  let bestCount = 0

  for (let i = 0; i < groups.length; i++) {
    // single group
    const single = ofClan.filter((c) => c.group === groups[i]).length
    if (single > bestCount) {
      bestCount = single
      best = [groups[i], groups[i]]
    }
    // consecutive pair
    if (i + 1 < groups.length && groups[i + 1] === groups[i] + 1) {
      const pair = ofClan.filter((c) => c.group === groups[i] || c.group === groups[i + 1]).length
      if (pair > bestCount) {
        bestCount = pair
        best = [groups[i], groups[i + 1]]
      }
    }
  }

  return best
}

/** Build a crypt: 12 vampires from the given clan and group pair, with varied counts. */
const buildCrypt = (clan: string, groupPair: [number, number]): DeckCardEntry[] => {
  const candidates = crypt.filter(
    (c) => c.clans.includes(clan) && c.group >= groupPair[0] && c.group <= groupPair[1],
  )

  // pick 12 unique vampires (or as many as available)
  const picks = pickRandom(candidates, Math.min(12, candidates.length))

  return picks.map((c) => ({
    cardId: String(c.id),
    count: 1,
  }))
}

/** Collect all disciplines (lowercase) from the crypt picks. */
const cryptDisciplines = (entries: DeckCardEntry[]): Set<string> => {
  const ids = new Set(entries.map((e) => e.cardId))
  const discs = new Set<string>()
  for (const c of crypt) {
    if (ids.has(String(c.id))) {
      for (const d of c.disciplines ?? []) {
        discs.add(d.toLowerCase())
      }
    }
  }
  return discs
}

/** Build a library of 60-75 cards matching the crypt's disciplines + generic staples. */
const buildLibrary = (clan: string, discs: Set<string>): DeckCardEntry[] => {
  const targetSize = 60 + Math.floor(Math.random() * 16) // 60-75

  // categorize library cards
  const masters = library.filter((c) => c.types.includes('Master'))
  const clanCards = library.filter((c) => c.clans?.includes(clan))
  const discCards = library.filter(
    (c) => !c.clans?.length && c.disciplines?.some((d) => discs.has(d.toLowerCase())),
  )
  const generic = library.filter(
    (c) => !c.clans?.length && !c.disciplines?.length && !c.types.includes('Event') && !c.types.includes('Conviction') && !c.types.includes('Power'),
  )

  const selected = new Map<string, number>()

  const addCards = (pool: RawLibraryCard[], count: number, maxCopies: number) => {
    const picks = pickRandom(pool, count)
    for (const card of picks) {
      const id = String(card.id)
      const copies = 1 + Math.floor(Math.random() * maxCopies)
      selected.set(id, (selected.get(id) ?? 0) + copies)
    }
  }

  // ~10-15 masters
  addCards(masters, 8 + Math.floor(Math.random() * 5), 2)
  // ~8-12 clan-specific
  addCards(clanCards, Math.min(8, clanCards.length), 2)
  // ~15-20 discipline-matching
  addCards(discCards, 12 + Math.floor(Math.random() * 6), 3)
  // fill the rest with generic cards
  addCards(generic, 20 + Math.floor(Math.random() * 10), 3)

  // trim or pad to target size
  const entries: DeckCardEntry[] = [...selected.entries()].map(([cardId, count]) => ({ cardId, count }))

  let total = entries.reduce((s, e) => s + e.count, 0)

  // trim from the end if over
  while (total > targetSize && entries.length > 0) {
    const last = entries[entries.length - 1]
    if (last.count > 1) {
      last.count--
    } else {
      entries.pop()
    }
    total--
  }

  // pad with more generic cards if under
  if (total < 60) {
    const extras = pickRandom(generic, 60 - total)
    for (const card of extras) {
      const existing = entries.find((e) => e.cardId === String(card.id))
      if (existing) {
        existing.count++
      } else {
        entries.push({ cardId: String(card.id), count: 1 })
      }
      total++
      if (total >= 60) break
    }
  }

  return entries
}

// ─── Deck definitions ─────────────────────────────────────────────────────────

const deckConfigs: { clan: string; name: string; description: string }[] = [
  // User 1 - Camarilla clans
  { clan: 'Toreador', name: 'Toreador Bleed', description: 'Classic Toreador stealth-bleed with Presence and Celerity' },
  { clan: 'Ventrue', name: 'Ventrue Lawfirm', description: 'Ventrue vote-bleed with Dominate and Fortitude' },
  { clan: 'Malkavian', name: 'Malk Madness', description: 'Dementation stealth-bleed with Malkavian vampires' },
  { clan: 'Tremere', name: 'Tremere Toolbox', description: 'Thaumaturgy-based toolbox with versatile options' },
  { clan: 'Nosferatu', name: 'Nosferatu Wall', description: 'Nosferatu intercept-combat with Animalism and Potence' },

  // User 2 - Sabbat clans
  { clan: 'Lasombra', name: 'Lasombra Nocturn', description: 'Obtenebration-heavy stealth-bleed with Lasombra' },
  { clan: 'Tzimisce', name: 'Tzimisce War Ghouls', description: 'Vicissitude combat with War Ghoul allies' },
  { clan: 'Brujah antitribu', name: 'Brujah Anti Rush', description: 'Aggressive rush combat with Potence and Celerity' },
  { clan: 'Ventrue antitribu', name: 'Ventrue Anti Vote', description: 'Sabbat political deck with Dominate' },
  { clan: 'Toreador antitribu', name: 'Toreador Anti Bleed', description: 'Presence stealth-bleed from the Sabbat side' },

  // User 3 - Independent / Laibon
  { clan: 'Giovanni', name: 'Giovanni Powerbleed', description: 'Necromancy-based bleed with Giovanni vampires' },
  { clan: 'Assamite', name: 'Assamite Rush', description: 'Quietus combat rush deck with Assamite assassins' },
  { clan: 'Ravnos', name: 'Ravnos Tricks', description: 'Chimerstry-based tricks and week of nightmares' },
  { clan: 'Follower of Set', name: 'Setite Corruption', description: 'Serpentis-based corruption and bleed' },
  { clan: 'Gangrel', name: 'Gangrel Combat', description: 'Protean and Animalism combat with Gangrel' },

  // User 4 - Mixed strategies
  { clan: 'Brujah', name: 'Brujah Presence Vote', description: 'Camarilla Brujah political action deck' },
  { clan: 'Gangrel antitribu', name: 'Gangrel Anti Wall', description: 'Protean intercept-combat wall' },
  { clan: 'Salubri antitribu', name: 'Salubri Anti Bleed', description: 'Valeren combat and bleed' },
  { clan: 'Samedi', name: 'Samedi Thanatosis', description: 'Thanatosis combat with Samedi vampires' },
  { clan: 'Baali', name: 'Baali Infernal', description: 'Daimoinon-based infernal politics' },

  // User 5 - Exotic clans
  { clan: 'Guruhi', name: 'Guruhi Potence Rush', description: 'Laibon Guruhi Potence combat rush' },
  { clan: 'Osebo', name: 'Osebo Celerity Bleed', description: 'Laibon Osebo with Celerity bleed' },
  { clan: 'Kiasyd', name: 'Kiasyd Stealth', description: 'Mytherceria stealth-bleed with Kiasyd' },
  { clan: 'Daughter of Cacophony', name: 'Daughters Choir', description: 'Melpominee bleed actions' },
  { clan: 'Harbinger of Skulls', name: 'Harbingers Necro', description: 'Necromancy combat and allies' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  const flush = process.argv.includes('--flush')
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

  if (flush) {
    await redis.flushdb()
    console.log('Flushed Redis database')
  }

  const now = new Date().toISOString()
  const pipeline = redis.pipeline()

  for (let u = 1; u <= 5; u++) {
    const userId = `test-user-${u}`
    const user: User = { id: userId, name: `Test User ${u}`, createdAt: now }
    pipeline.set(`user:${userId}`, JSON.stringify(user))

    const userDecks = deckConfigs.slice((u - 1) * 5, u * 5)

    for (const cfg of userDecks) {
      const deckId = randomUUID()
      const groupPair = bestGroupPair(cfg.clan)
      const cryptEntries = buildCrypt(cfg.clan, groupPair)
      const discs = cryptDisciplines(cryptEntries)
      const libraryEntries = buildLibrary(cfg.clan, discs)

      const deck: Deck = {
        id: deckId,
        userId,
        name: cfg.name,
        description: cfg.description,
        crypt: cryptEntries,
        library: libraryEntries,
        createdAt: now,
        updatedAt: now,
      }

      const cryptTotal = cryptEntries.reduce((s, e) => s + e.count, 0)
      const libTotal = libraryEntries.reduce((s, e) => s + e.count, 0)
      console.log(`  ${cfg.name} (${cfg.clan} G${groupPair[0]}-${groupPair[1]}) — crypt: ${cryptTotal}, library: ${libTotal}`)

      pipeline.set(`deck:${deckId}`, JSON.stringify(deck))
      pipeline.sadd(`user:${userId}:decks`, deckId)
    }

    console.log(`Created ${userId} with 5 decks`)
  }

  await pipeline.exec()
  console.log('\nDone! Seeded 5 users with 25 decks total.')
  await redis.quit()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
