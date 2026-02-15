import type { GameState, GameSummary, GameView, PlayerState, PublicPlayerView } from '$/types/game'
import type { ActionLogEntry } from '$/types/game-actions'

const toPublicPlayerView = (player: PlayerState): PublicPlayerView => ({
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

const toGameSummary = (game: GameState, actionLog: ActionLogEntry[]): GameSummary => ({
  id: game.id,
  name: game.name,
  status: game.status,
  playerCount: game.playerOrder.length,
  players: game.playerOrder.map((id) => toPublicPlayerView(game.players[id])),
  round: game.round,
  turnCount: game.turnCount,
  activePlayer: game.turn.activePlayer,
  phase: game.turn.phase,
  actionLog,
})

const toGameView = (game: GameState, playerId: string, actionLog: ActionLogEntry[]): GameView => ({
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
  opponents: game.playerOrder.filter((id) => id !== playerId).map((id) => toPublicPlayerView(game.players[id])),
  actionLog,
})

export { toGameSummary, toGameView }
