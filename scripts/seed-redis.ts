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

import type { ControlledCryptCard, GameState, PlayerState, UncontrolledCryptCard } from '$/types/game'
import type { ActionLogEntry, GameAction } from '$/types/game-actions'

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

/** Expand { cardId, count }[] into a flat array of card IDs (each repeated count times). */
const expandEntries = (entries: DeckCardEntry[]): string[] =>
  entries.flatMap((e) => Array.from({ length: e.count }, () => e.cardId))

/** Look up a crypt card's capacity by its string ID. */
const cryptCapacity = (cardId: string): number => {
  const card = crypt.find((c) => String(c.id) === cardId)
  return card?.capacity ?? 5
}

type PlayerConfig = {
  vampiresOut: number
  vampiresInTorpor: number
  lockedVampires: number
  uncontrolledCount: number
  pool: number
  cardsPlayed: number
  handSize: number
  victoryPoints: number
}

/** Build a mid-game PlayerState shaped by a config. */
const buildPlayerState = (userId: string, userName: string, deck: Deck, cfg: PlayerConfig): PlayerState => {
  const cryptCards = shuffle(expandEntries(deck.crypt))
  const libraryCards = shuffle(expandEntries(deck.library))

  // Influence vampires into play
  const minionCards = cryptCards.splice(0, cfg.vampiresOut)
  const controlledCrypt: ControlledCryptCard[] = minionCards.map((cardId, i) => {
    const capacity = cryptCapacity(cardId)
    const inTorpor = i < cfg.vampiresInTorpor
    // Vampires in torpor have 0 blood; others have varied blood levels
    const counters = inTorpor ? 0 : Math.max(1, capacity - Math.floor(Math.random() * 3))
    return {
      instanceId: randomUUID(),
      cardId,
      owner: userId,
      controller: userId,
      counters,
      locked: !inTorpor && i < cfg.lockedVampires,
      inTorpor,
    }
  })

  // Uncontrolled crypt cards (influenced but not yet out)
  const uncontrolledCards = cryptCards.splice(0, cfg.uncontrolledCount)
  const uncontrolledCrypt: UncontrolledCryptCard[] = uncontrolledCards.map((cardId) => ({
    instanceId: randomUUID(),
    cardId,
    owner: userId,
    blood: Math.floor(Math.random() * 3),
  }))

  // Simulate cards played → ash heap
  const ashHeap = libraryCards.splice(0, cfg.cardsPlayed)

  // Draw hand
  const hand = libraryCards.splice(0, cfg.handSize)

  return {
    playerId: userId,
    deckId: deck.id,
    name: userName,
    pool: cfg.pool,
    library: libraryCards,
    crypt: cryptCards,
    hand,
    ashHeap,
    removed: [],
    controlledCrypt,
    libraryCardsInPlay: [],
    uncontrolledCrypt,
    ousted: false,
    victoryPoints: cfg.victoryPoints,
  }
}

// Per-player configs simulating ~6 rounds of play
const playerConfigs: PlayerConfig[] = [
  // Player 1 (Toreador Bleed) — aggressive bleeder, spent pool on vampires, took some hits
  {
    vampiresOut: 3,
    vampiresInTorpor: 0,
    lockedVampires: 1,
    uncontrolledCount: 1,
    pool: 17,
    cardsPlayed: 15,
    handSize: 5,
    victoryPoints: 0,
  },
  // Player 2 (Lasombra Nocturn) — stealth-bleed, one vampire got sent to torpor
  {
    vampiresOut: 3,
    vampiresInTorpor: 1,
    lockedVampires: 1,
    uncontrolledCount: 0,
    pool: 11,
    cardsPlayed: 18,
    handSize: 4,
    victoryPoints: 0,
  },
  // Player 3 (Giovanni Powerbleed) — conservative play, healthy pool
  {
    vampiresOut: 3,
    vampiresInTorpor: 0,
    lockedVampires: 0,
    uncontrolledCount: 0,
    pool: 21,
    cardsPlayed: 12,
    handSize: 6,
    victoryPoints: 0,
  },
  // Player 4 (Brujah Presence Vote) — strong political position, gained pool from votes
  {
    vampiresOut: 4,
    vampiresInTorpor: 0,
    lockedVampires: 2,
    uncontrolledCount: 0,
    pool: 24,
    cardsPlayed: 10,
    handSize: 7,
    victoryPoints: 0,
  },
  // Player 5 (Guruhi Potence Rush) — in trouble, rushed hard but took damage
  {
    vampiresOut: 2,
    vampiresInTorpor: 0,
    lockedVampires: 1,
    uncontrolledCount: 1,
    pool: 6,
    cardsPlayed: 20,
    handSize: 3,
    victoryPoints: 0,
  },
]

/** Build and store a test GameState in Redis. */
const seedTestGame = async (redis: Redis, gamePlayers: { userId: string; userName: string; deck: Deck }[]) => {
  const now = new Date().toISOString()
  const playerOrder = gamePlayers.map((p) => p.userId)

  const players: Record<string, PlayerState> = {}
  for (let i = 0; i < gamePlayers.length; i++) {
    const p = gamePlayers[i]
    players[p.userId] = buildPlayerState(p.userId, p.userName, p.deck, playerConfigs[i])
  }

  const game: GameState = {
    id: 'test-game',
    name: 'Test Game',
    status: 'active',
    createdAt: now,
    playerOrder,
    round: 6,
    turnCount: 30,
    influenceCounter: 4,
    turn: { activePlayer: playerOrder[0], phase: 'minion' },
    edge: { heldBy: playerOrder[3] },
    contestedCards: [],
    players,
  }

  // Build sample action log entries
  const sampleActions: { playerIdx: number; type: GameAction['type']; desc: string }[] = [
    { playerIdx: 0, type: 'drawFromLibrary', desc: 'drew 1 card from library' },
    { playerIdx: 0, type: 'adjustPool', desc: 'lost 2 pool (now 17)' },
    { playerIdx: 1, type: 'drawFromCrypt', desc: 'drew 1 card from crypt' },
    { playerIdx: 1, type: 'toggleLock', desc: 'locked a minion' },
    { playerIdx: 2, type: 'advancePhase', desc: 'advanced to master phase' },
    { playerIdx: 3, type: 'adjustPool', desc: 'gained 1 pool (now 24)' },
    { playerIdx: 3, type: 'setEdge', desc: 'took the Edge' },
    { playerIdx: 4, type: 'drawFromLibrary', desc: 'drew 1 card from library' },
    { playerIdx: 0, type: 'advancePhase', desc: 'advanced to minion phase' },
    { playerIdx: 2, type: 'toggleLock', desc: 'unlocked a minion' },
  ]

  const logEntries: ActionLogEntry[] = sampleActions.map((a, i) => {
    const p = gamePlayers[a.playerIdx]
    const timestamp = new Date(Date.now() - (sampleActions.length - i) * 15000).toISOString()
    return {
      id: randomUUID(),
      timestamp,
      playerId: p.userId,
      playerName: p.userName,
      type: a.type,
      description: `${p.userName} ${a.desc}`,
    }
  })

  const pipeline = redis.pipeline()
  pipeline.set('game:test-game', JSON.stringify(game))
  pipeline.sadd('game:test-game:players', ...playerOrder)
  pipeline.del('game:test-game:log')
  for (const entry of [...logEntries].reverse()) {
    pipeline.lpush('game:test-game:log', JSON.stringify(entry))
  }
  await pipeline.exec()

  console.log(`\nCreated test game (round ${game.round}, ${gamePlayers.length} players):`)
  for (const p of gamePlayers) {
    const ps = players[p.userId]
    const torporCount = ps.controlledCrypt.filter((m) => m.inTorpor).length
    console.log(
      `  ${p.userName} — pool: ${ps.pool}, vampires: ${ps.controlledCrypt.length}${torporCount ? ` (${torporCount} in torpor)` : ''}, hand: ${ps.hand.length}, ash heap: ${ps.ashHeap.length}, library: ${ps.library.length}`
    )
  }
  console.log(`  Seeded ${logEntries.length} action log entries`)
}

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
  const candidates = crypt.filter((c) => c.clans.includes(clan) && c.group >= groupPair[0] && c.group <= groupPair[1])

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
  const discCards = library.filter((c) => !c.clans?.length && c.disciplines?.some((d) => discs.has(d.toLowerCase())))
  const generic = library.filter(
    (c) =>
      !c.clans?.length &&
      !c.disciplines?.length &&
      !c.types.includes('Event') &&
      !c.types.includes('Conviction') &&
      !c.types.includes('Power')
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
  {
    clan: 'Toreador',
    name: 'Toreador Bleed',
    description: 'Classic Toreador stealth-bleed with Presence and Celerity',
  },
  { clan: 'Ventrue', name: 'Ventrue Lawfirm', description: 'Ventrue vote-bleed with Dominate and Fortitude' },
  { clan: 'Malkavian', name: 'Malk Madness', description: 'Dementation stealth-bleed with Malkavian vampires' },
  { clan: 'Tremere', name: 'Tremere Toolbox', description: 'Thaumaturgy-based toolbox with versatile options' },
  { clan: 'Nosferatu', name: 'Nosferatu Wall', description: 'Nosferatu intercept-combat with Animalism and Potence' },

  // User 2 - Sabbat clans
  { clan: 'Lasombra', name: 'Lasombra Nocturn', description: 'Obtenebration-heavy stealth-bleed with Lasombra' },
  { clan: 'Tzimisce', name: 'Tzimisce War Ghouls', description: 'Vicissitude combat with War Ghoul allies' },
  {
    clan: 'Brujah antitribu',
    name: 'Brujah Anti Rush',
    description: 'Aggressive rush combat with Potence and Celerity',
  },
  { clan: 'Ventrue antitribu', name: 'Ventrue Anti Vote', description: 'Sabbat political deck with Dominate' },
  {
    clan: 'Toreador antitribu',
    name: 'Toreador Anti Bleed',
    description: 'Presence stealth-bleed from the Sabbat side',
  },

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
    const keys = await redis.keys('*')
    if (keys.length > 0) {
      const grouped: Record<string, number> = {}
      for (const key of keys) {
        const prefix = key.replace(/:.*/, ':*')
        grouped[prefix] = (grouped[prefix] ?? 0) + 1
      }
      console.log('Flushing Redis database:')
      for (const [prefix, count] of Object.entries(grouped).sort()) {
        console.log(`  ${prefix} — ${count} key${count > 1 ? 's' : ''}`)
      }
    } else {
      console.log('Flushing Redis database (empty)')
    }
    await redis.flushdb()
  }

  const now = new Date().toISOString()
  const pipeline = redis.pipeline()
  const gamePlayers: { userId: string; userName: string; deck: Deck }[] = []

  for (let u = 1; u <= 5; u++) {
    const userId = `test-user-${u}`
    const userName = `Test User ${u}`
    const user: User = { id: userId, name: userName, createdAt: now }
    pipeline.set(`user:${userId}`, JSON.stringify(user))

    const userDecks = deckConfigs.slice((u - 1) * 5, u * 5)

    for (let d = 0; d < userDecks.length; d++) {
      const cfg = userDecks[d]
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

      // Collect first deck per user for the test game
      if (d === 0) {
        gamePlayers.push({ userId, userName, deck })
      }

      const cryptTotal = cryptEntries.reduce((s, e) => s + e.count, 0)
      const libTotal = libraryEntries.reduce((s, e) => s + e.count, 0)
      console.log(
        `  ${cfg.name} (${cfg.clan} G${groupPair[0]}-${groupPair[1]}) — crypt: ${cryptTotal}, library: ${libTotal}`
      )

      pipeline.set(`deck:${deckId}`, JSON.stringify(deck))
      pipeline.sadd(`user:${userId}:decks`, deckId)
    }

    console.log(`Created ${userId} with 5 decks`)
  }

  await pipeline.exec()
  console.log('\nDone! Seeded 5 users with 25 decks total.')

  const base = process.env.BASE_URL ?? 'http://localhost:3000'
  console.log('\nRoutes:')
  for (let u = 1; u <= 5; u++) {
    console.log(`  ${base}/user/test-user-${u}  (Test User ${u} profile & decks)`)
  }
  console.log(`  ${base}/game/test-game  (game overview)`)
  for (let u = 1; u <= 5; u++) {
    console.log(`  ${base}/game/test-game/test-user-${u}  (Test User ${u} game view)`)
  }

  await seedTestGame(redis, gamePlayers)
  await redis.quit()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
