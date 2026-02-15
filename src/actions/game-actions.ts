'use server'

import { toGameSummary, toGameView } from '$/lib/game-views'
import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { GameState, GameSummary, GameView, PlayerState } from '$/types/game'
import type { ActionLogEntry, GameAction } from '$/types/game-actions'
import { applyGameAction } from './game-action-handlers'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createEmptyPlayer = (playerId: string, name: string): PlayerState => ({
  playerId,
  deckId: '',
  name,
  pool: 30,
  library: [],
  crypt: [],
  hand: [],
  ashHeap: [],
  removed: [],
  minions: [],
  libraryCardsInPlay: [],
  uncontrolled: [],
  ousted: false,
  victoryPoints: 0,
})

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const getGame = async (gameId: string): Promise<ActionResult<GameSummary>> => {
  const [raw, logEntries] = await Promise.all([redis.get(`game:${gameId}`), redis.lrange(`game:${gameId}:log`, 0, 49)])
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }
  const actionLog = logEntries.map((entry) => JSON.parse(entry) as ActionLogEntry)
  return { success: true, data: toGameSummary(JSON.parse(raw) as GameState, actionLog) }
}

const MAX_NAME_LENGTH = 200

const createGame = async (
  name: string,
  creatorUserId: string,
  creatorName: string
): Promise<ActionResult<GameSummary>> => {
  const trimmedName = name.trim()
  if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
    return { success: false, error: 'Game name is required and must be under 200 characters' }
  }

  const gameId = crypto.randomUUID()
  const now = new Date().toISOString()

  const game: GameState = {
    id: gameId,
    name: trimmedName,
    status: 'waiting',
    createdAt: now,
    playerOrder: [creatorUserId],
    round: 0,
    turnCount: 0,
    influenceCounter: 1,
    turn: { activePlayer: creatorUserId, phase: 'unlock' },
    edge: {},
    contestedCards: [],
    players: {
      [creatorUserId]: createEmptyPlayer(creatorUserId, creatorName.trim()),
    },
  }

  await redis
    .pipeline()
    .set(`game:${gameId}`, JSON.stringify(game))
    .sadd(`game:${gameId}:players`, creatorUserId)
    .exec()

  return { success: true, data: toGameSummary(game, []) }
}

const joinGame = async (gameId: string, userId: string, playerName: string): Promise<ActionResult<GameSummary>> => {
  const trimmedPlayerName = playerName.trim()
  if (!trimmedPlayerName || trimmedPlayerName.length > MAX_NAME_LENGTH) {
    return { success: false, error: 'Player name is required and must be under 200 characters' }
  }

  const raw = await redis.get(`game:${gameId}`)
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }

  const game = JSON.parse(raw) as GameState
  if (game.status !== 'waiting') {
    return { success: false, error: 'Game already started' }
  }

  if (game.players[userId]) {
    return { success: false, error: 'Already in game' }
  }

  game.playerOrder.push(userId)
  game.players[userId] = createEmptyPlayer(userId, trimmedPlayerName)

  await redis
    .pipeline()
    .set(`game:${gameId}`, JSON.stringify(game))
    .sadd(`game:${gameId}:players`, userId)
    .publish(`game:${gameId}:events`, JSON.stringify({ type: 'gameStateChanged' }))
    .exec()

  return { success: true, data: toGameSummary(game, []) }
}

const getGameView = async (gameId: string, userId: string): Promise<ActionResult<GameView>> => {
  const [raw, logEntries] = await Promise.all([redis.get(`game:${gameId}`), redis.lrange(`game:${gameId}:log`, 0, 49)])
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }

  const game = JSON.parse(raw) as GameState
  if (!game.players[userId]) {
    return { success: false, error: 'Player not in game' }
  }

  const actionLog = logEntries.map((entry) => JSON.parse(entry) as ActionLogEntry)
  return { success: true, data: toGameView(game, userId, actionLog) }
}

const performGameAction = async (
  gameId: string,
  playerId: string,
  action: GameAction
): Promise<ActionResult<ActionLogEntry>> => {
  const raw = await redis.get(`game:${gameId}`)
  if (!raw) return { success: false, error: 'Game not found' }

  const game = JSON.parse(raw) as GameState
  if (game.status !== 'active') return { success: false, error: 'Game is not active' }

  const player = game.players[playerId]
  if (!player) return { success: false, error: 'Player not in game' }

  const cloned = structuredClone(game)
  const result = applyGameAction(cloned, playerId, action)
  if (!result.success) return result

  const entry: ActionLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    playerId,
    playerName: player.name,
    type: action.type,
    description: `${player.name} ${result.description}`,
  }

  await redis
    .pipeline()
    .set(`game:${gameId}`, JSON.stringify(result.state))
    .lpush(`game:${gameId}:log`, JSON.stringify(entry))
    .ltrim(`game:${gameId}:log`, 0, 199)
    .publish(`game:${gameId}:events`, JSON.stringify({ type: 'gameStateChanged' }))
    .exec()

  return { success: true, data: entry }
}

export { createGame, getGame, getGameView, joinGame, performGameAction }
