'use server'

import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { GamePublicState, PlayerPrivateState } from '$/types/game'

const getGame = async (gameId: string): Promise<ActionResult<GamePublicState>> => {
  const raw = await redis.get(`game:${gameId}`)
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }
  return { success: true, data: JSON.parse(raw) as GamePublicState }
}

const MAX_NAME_LENGTH = 200

const createGame = async (
  name: string,
  creatorUserId: string,
  creatorName: string
): Promise<ActionResult<GamePublicState>> => {
  const trimmedName = name.trim()
  if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
    return { success: false, error: 'Game name is required and must be under 200 characters' }
  }

  const gameId = crypto.randomUUID()
  const now = new Date().toISOString()

  const game: GamePublicState = {
    id: gameId,
    name: trimmedName,
    status: 'waiting',
    players: [{ userId: creatorUserId, name: creatorName.trim(), poolSize: 30, vampiresInPlay: 0 }],
    currentTurn: creatorUserId,
    turnNumber: 0,
    createdAt: now,
  }

  await redis
    .pipeline()
    .set(`game:${gameId}`, JSON.stringify(game))
    .sadd(`game:${gameId}:players`, creatorUserId)
    .exec()

  return { success: true, data: game }
}

const joinGame = async (gameId: string, userId: string, playerName: string): Promise<ActionResult<GamePublicState>> => {
  const trimmedPlayerName = playerName.trim()
  if (!trimmedPlayerName || trimmedPlayerName.length > MAX_NAME_LENGTH) {
    return { success: false, error: 'Player name is required and must be under 200 characters' }
  }

  const raw = await redis.get(`game:${gameId}`)
  if (!raw) {
    return { success: false, error: 'Game not found' }
  }

  const game = JSON.parse(raw) as GamePublicState
  if (game.status !== 'waiting') {
    return { success: false, error: 'Game already started' }
  }

  if (game.players.some((p) => p.userId === userId)) {
    return { success: false, error: 'Already in game' }
  }

  game.players.push({ userId, name: trimmedPlayerName, poolSize: 30, vampiresInPlay: 0 })

  await redis.pipeline().set(`game:${gameId}`, JSON.stringify(game)).sadd(`game:${gameId}:players`, userId).exec()

  return { success: true, data: game }
}

const getPlayerState = async (gameId: string, userId: string): Promise<ActionResult<PlayerPrivateState>> => {
  const raw = await redis.get(`game:${gameId}:player:${userId}`)
  if (!raw) {
    return { success: false, error: 'Player state not found' }
  }
  return { success: true, data: JSON.parse(raw) as PlayerPrivateState }
}

const initPlayerState = async (gameId: string, userId: string): Promise<ActionResult<PlayerPrivateState>> => {
  const state: PlayerPrivateState = {
    userId,
    gameId,
    hand: [],
    librarySize: 0,
    cryptSize: 0,
    pool: 30,
    vampiresInPlay: [],
    uncontrolledRegion: [],
  }

  await redis.set(`game:${gameId}:player:${userId}`, JSON.stringify(state))
  return { success: true, data: state }
}

const updatePlayerState = async (
  gameId: string,
  userId: string,
  callerUserId: string,
  updates: Partial<Omit<PlayerPrivateState, 'userId' | 'gameId'>>
): Promise<ActionResult<PlayerPrivateState>> => {
  if (userId !== callerUserId) {
    return { success: false, error: 'Not authorized to update this player state' }
  }

  const raw = await redis.get(`game:${gameId}:player:${userId}`)
  if (!raw) {
    return { success: false, error: 'Player state not found' }
  }

  const state = JSON.parse(raw) as PlayerPrivateState
  const updated: PlayerPrivateState = { ...state, ...updates }

  await redis.set(`game:${gameId}:player:${userId}`, JSON.stringify(updated))
  return { success: true, data: updated }
}

export { createGame, getGame, getPlayerState, initPlayerState, joinGame, updatePlayerState }
