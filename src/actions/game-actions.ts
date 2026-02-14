'use server'

import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { GameState, GameSummary, GameView, OpponentView, PlayerState, PlayerSummary } from '$/types/game'

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

const toPlayerSummary = (player: PlayerState): PlayerSummary => ({
  playerId: player.playerId,
  name: player.name,
  pool: player.pool,
  vampiresInPlay: player.minions.filter((m) => !m.inTorpor).length,
})

const toGameSummary = (game: GameState): GameSummary => ({
  id: game.id,
  name: game.name,
  status: game.status,
  playerCount: game.playerOrder.length,
  players: game.playerOrder.map((id) => toPlayerSummary(game.players[id])),
  round: game.round,
  turnCount: game.turnCount,
  activePlayer: game.turn.activePlayer,
})

const toOpponentView = (player: PlayerState): OpponentView => ({
  playerId: player.playerId,
  name: player.name,
  pool: player.pool,
  librarySize: player.library.length,
  cryptSize: player.crypt.length,
  handSize: player.hand.length,
  ashHeap: player.ashHeap,
  removed: player.removed,
  minions: player.minions,
  libraryCardsInPlay: player.libraryCardsInPlay,
  uncontrolled: player.uncontrolled.map((u) => ({ instanceId: u.instanceId, blood: u.blood })),
  ousted: player.ousted,
  victoryPoints: player.victoryPoints,
})

const toGameView = (game: GameState, playerId: string): GameView => ({
  id: game.id,
  name: game.name,
  status: game.status,
  createdAt: game.createdAt,
  playerOrder: game.playerOrder,
  round: game.round,
  turnCount: game.turnCount,
  influenceCounter: game.influenceCounter,
  turn: game.turn,
  edge: game.edge,
  contestedCards: game.contestedCards,
  self: game.players[playerId],
  opponents: game.playerOrder.filter((id) => id !== playerId).map((id) => toOpponentView(game.players[id])),
})

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
  const raw = await redis.get(`game:${gameId}`)
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }
  return { success: true, data: toGameSummary(JSON.parse(raw) as GameState) }
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

  return { success: true, data: toGameSummary(game) }
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

  await redis.pipeline().set(`game:${gameId}`, JSON.stringify(game)).sadd(`game:${gameId}:players`, userId).exec()

  return { success: true, data: toGameSummary(game) }
}

const getGameView = async (gameId: string, userId: string): Promise<ActionResult<GameView>> => {
  const raw = await redis.get(`game:${gameId}`)
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }

  const game = JSON.parse(raw) as GameState
  if (!game.players[userId]) {
    return { success: false, error: 'Player not in game' }
  }

  return { success: true, data: toGameView(game, userId) }
}

export { createGame, getGame, getGameView, joinGame }
