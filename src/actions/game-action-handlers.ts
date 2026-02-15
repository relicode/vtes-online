import { getCardById } from '$/data/cards'
import type { GameState, MinionInPlay, TurnPhase } from '$/types/game'
import type { CardZone, GameAction } from '$/types/game-actions'

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

type HandlerSuccess = { success: true; state: GameState; description: string }
type HandlerError = { success: false; error: string }
type HandlerResult = HandlerSuccess | HandlerError

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PHASES: TurnPhase[] = ['unlock', 'master', 'minion', 'influence', 'discard']

const getPlayerZone = (player: GameState['players'][string], zone: CardZone): string[] => {
  const zones: Record<CardZone, string[]> = {
    hand: player.hand,
    ashHeap: player.ashHeap,
    library: player.library,
    crypt: player.crypt,
    removed: player.removed,
  }
  return zones[zone]
}

const nextActivePlayer = (state: GameState): string => {
  const { playerOrder } = state
  const currentIdx = playerOrder.indexOf(state.turn.activePlayer)
  for (let i = 1; i <= playerOrder.length; i++) {
    const candidate = playerOrder[(currentIdx + i) % playerOrder.length]
    if (!state.players[candidate].ousted) return candidate
  }
  return state.turn.activePlayer
}

// ---------------------------------------------------------------------------
// Per-action handlers
// ---------------------------------------------------------------------------

const handleDrawFromLibrary = (state: GameState, playerId: string, count: number): HandlerResult => {
  const player = state.players[playerId]
  if (player.library.length === 0) return { success: false, error: 'Library is empty' }
  const actual = Math.min(count, player.library.length)
  const drawn = player.library.splice(0, actual)
  player.hand.push(...drawn)
  return { success: true, state, description: `drew ${actual} card${actual !== 1 ? 's' : ''} from library` }
}

const handleDrawFromCrypt = (state: GameState, playerId: string, count: number): HandlerResult => {
  const player = state.players[playerId]
  if (player.crypt.length === 0) return { success: false, error: 'Crypt is empty' }
  const actual = Math.min(count, player.crypt.length)
  const drawn = player.crypt.splice(0, actual)
  for (const cardId of drawn) {
    player.uncontrolled.push({ instanceId: crypto.randomUUID(), cardId, blood: 0 })
  }
  return { success: true, state, description: `drew ${actual} card${actual !== 1 ? 's' : ''} from crypt` }
}

const handleToggleLock = (state: GameState, playerId: string, instanceId: string): HandlerResult => {
  const player = state.players[playerId]
  const target =
    player.minions.find((m) => m.instanceId === instanceId) ??
    player.libraryCardsInPlay.find((c) => c.instanceId === instanceId)
  if (!target) return { success: false, error: 'Card not found' }
  target.locked = !target.locked
  const name = getCardById(target.cardId)?.name ?? 'a card'
  return { success: true, state, description: `${target.locked ? 'locked' : 'unlocked'} ${name}` }
}

const handleAdjustMinionCounters = (
  state: GameState,
  playerId: string,
  minionInstanceId: string,
  delta: number
): HandlerResult => {
  const player = state.players[playerId]
  const minion = player.minions.find((m) => m.instanceId === minionInstanceId)
  if (!minion) return { success: false, error: 'Minion not found' }
  minion.counters = Math.max(0, minion.counters + delta)
  const verb = delta > 0 ? 'added' : 'removed'
  return {
    success: true,
    state,
    description: `${verb} ${Math.abs(delta)} counter${Math.abs(delta) !== 1 ? 's' : ''} on a minion`,
  }
}

const handleAdjustPool = (state: GameState, playerId: string, delta: number): HandlerResult => {
  const player = state.players[playerId]
  player.pool = Math.max(0, player.pool + delta)
  const verb = delta > 0 ? 'gained' : 'lost'
  return { success: true, state, description: `${verb} ${Math.abs(delta)} pool (now ${player.pool})` }
}

const handleMoveCard = (
  state: GameState,
  playerId: string,
  cardId: string,
  from: CardZone,
  to: CardZone,
  index?: number
): HandlerResult => {
  const player = state.players[playerId]
  const sourceZone = getPlayerZone(player, from)
  const cardIdx = index ?? sourceZone.indexOf(cardId)
  if (cardIdx === -1 || cardIdx >= sourceZone.length) return { success: false, error: 'Card not found in source zone' }
  const [removed] = sourceZone.splice(cardIdx, 1)
  const destZone = getPlayerZone(player, to)
  destZone.push(removed)
  return { success: true, state, description: `moved a card from ${from} to ${to}` }
}

const influenceUncontrolled = (state: GameState): string[] => {
  const player = state.players[state.turn.activePlayer]
  const influenced: string[] = []

  for (let i = player.uncontrolled.length - 1; i >= 0; i--) {
    const u = player.uncontrolled[i]
    const card = getCardById(u.cardId)
    const capacity = card?.type === 'crypt' ? card.capacity : 0
    if (capacity > 0 && u.blood >= capacity) {
      player.uncontrolled.splice(i, 1)
      player.minions.push({
        instanceId: u.instanceId,
        cardId: u.cardId,
        counters: u.blood,
        locked: false,
        inTorpor: false,
      })
      influenced.push(card?.name ?? 'Unknown')
    }
  }

  return influenced
}

const handleAdvancePhase = (state: GameState): HandlerResult => {
  const currentPhaseIdx = PHASES.indexOf(state.turn.phase)

  if (state.turn.phase === 'influence') {
    const influenced = influenceUncontrolled(state)
    const suffix = influenced.length > 0 ? ` (${influenced.join(', ')} moved to controlled)` : ''
    state.turn.phase = PHASES[currentPhaseIdx + 1]
    return { success: true, state, description: `advanced to ${state.turn.phase} phase${suffix}` }
  }

  if (currentPhaseIdx < PHASES.length - 1) {
    state.turn.phase = PHASES[currentPhaseIdx + 1]
    return { success: true, state, description: `advanced to ${state.turn.phase} phase` }
  }
  // Wrap: discard → unlock of next player
  const nextPlayer = nextActivePlayer(state)
  const wrappedAround = state.playerOrder.indexOf(nextPlayer) <= state.playerOrder.indexOf(state.turn.activePlayer)
  state.turn.activePlayer = nextPlayer
  state.turn.phase = 'unlock'
  state.turnCount++
  if (wrappedAround) state.round++
  return {
    success: true,
    state,
    description: `ended turn — ${state.players[nextPlayer].name}'s turn (${state.turn.phase} phase)`,
  }
}

const handleSetEdge = (state: GameState, playerId: string, targetPlayerId?: string): HandlerResult => {
  state.edge.heldBy = targetPlayerId ?? playerId
  const holder = state.players[state.edge.heldBy]
  return { success: true, state, description: `took the Edge${holder ? ` (held by ${holder.name})` : ''}` }
}

const handleAdjustUncontrolledBlood = (
  state: GameState,
  playerId: string,
  minionInstanceId: string,
  delta: number
): HandlerResult => {
  const player = state.players[playerId]
  const minion = player.uncontrolled.find((m) => m.instanceId === minionInstanceId)
  if (!minion) return { success: false, error: 'Uncontrolled minion not found' }
  minion.blood = Math.max(0, minion.blood + delta)
  const verb = delta > 0 ? 'added' : 'removed'
  return { success: true, state, description: `${verb} ${Math.abs(delta)} blood on uncontrolled minion` }
}

const handleInfluence = (state: GameState, playerId: string, minionInstanceId: string): HandlerResult => {
  const player = state.players[playerId]
  const idx = player.uncontrolled.findIndex((m) => m.instanceId === minionInstanceId)
  if (idx === -1) return { success: false, error: 'Uncontrolled minion not found' }
  const [uncontrolled] = player.uncontrolled.splice(idx, 1)
  const controlled: MinionInPlay = {
    instanceId: uncontrolled.instanceId,
    cardId: uncontrolled.cardId,
    counters: uncontrolled.blood,
    locked: false,
    inTorpor: false,
  }
  player.minions.push(controlled)
  return { success: true, state, description: 'moved a minion from uncontrolled to controlled' }
}

const handlePlayFromHand = (state: GameState, playerId: string, indices: number[]): HandlerResult => {
  const player = state.players[playerId]
  const unique = [...new Set(indices)]
  if (unique.some((i) => i < 0 || i >= player.hand.length)) {
    return { success: false, error: 'Invalid card index' }
  }

  const sorted = unique.sort((a, b) => b - a)
  const names: string[] = []

  for (const idx of sorted) {
    const cardId = player.hand[idx]
    player.hand.splice(idx, 1)
    const card = getCardById(cardId)
    names.push(card?.name ?? 'Unknown')

    if (card?.type === 'crypt') {
      player.minions.push({
        instanceId: crypto.randomUUID(),
        cardId,
        counters: 0,
        locked: false,
        inTorpor: false,
      })
    } else {
      player.libraryCardsInPlay.push({
        instanceId: crypto.randomUUID(),
        cardId,
        counters: 0,
        locked: false,
      })
    }
  }

  return { success: true, state, description: `played ${names.join(', ')}` }
}

const handleTrashFromPlay = (state: GameState, playerId: string, instanceIds: string[]): HandlerResult => {
  const player = state.players[playerId]

  // Validate all IDs exist before mutating
  for (const instanceId of instanceIds) {
    const found =
      player.minions.some((m) => m.instanceId === instanceId) ||
      player.libraryCardsInPlay.some((c) => c.instanceId === instanceId) ||
      player.uncontrolled.some((u) => u.instanceId === instanceId)
    if (!found) return { success: false, error: `Card ${instanceId} not found in play` }
  }

  const names: string[] = []
  for (const instanceId of instanceIds) {
    const minionIdx = player.minions.findIndex((m) => m.instanceId === instanceId)
    if (minionIdx !== -1) {
      const [minion] = player.minions.splice(minionIdx, 1)
      player.ashHeap.push(minion.cardId)
      names.push(getCardById(minion.cardId)?.name ?? 'Unknown')
      continue
    }

    const libIdx = player.libraryCardsInPlay.findIndex((c) => c.instanceId === instanceId)
    if (libIdx !== -1) {
      const [card] = player.libraryCardsInPlay.splice(libIdx, 1)
      player.ashHeap.push(card.cardId)
      names.push(getCardById(card.cardId)?.name ?? 'Unknown')
      continue
    }

    const uncontrolledIdx = player.uncontrolled.findIndex((u) => u.instanceId === instanceId)
    if (uncontrolledIdx !== -1) {
      const [minion] = player.uncontrolled.splice(uncontrolledIdx, 1)
      player.ashHeap.push(minion.cardId)
      names.push(getCardById(minion.cardId)?.name ?? 'Unknown')
    }
  }

  return { success: true, state, description: `sent ${names.join(', ')} to ash heap` }
}

const handleToggleTorpor = (state: GameState, playerId: string, minionInstanceId: string): HandlerResult => {
  const player = state.players[playerId]
  const minion = player.minions.find((m) => m.instanceId === minionInstanceId)
  if (!minion) return { success: false, error: 'Minion not found' }
  minion.inTorpor = !minion.inTorpor
  return {
    success: true,
    state,
    description: `${minion.inTorpor ? 'sent a minion to' : 'rescued a minion from'} torpor`,
  }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const applyGameAction = (state: GameState, playerId: string, action: GameAction): HandlerResult => {
  switch (action.type) {
    case 'drawFromLibrary':
      return handleDrawFromLibrary(state, playerId, action.count ?? 1)
    case 'drawFromCrypt':
      return handleDrawFromCrypt(state, playerId, action.count ?? 1)
    case 'toggleLock':
      return handleToggleLock(state, playerId, action.instanceId)
    case 'adjustMinionCounters':
      return handleAdjustMinionCounters(state, playerId, action.minionInstanceId, action.delta)
    case 'adjustPool':
      return handleAdjustPool(state, playerId, action.delta)
    case 'moveCard':
      return handleMoveCard(state, playerId, action.cardId, action.from, action.to, action.index)
    case 'advancePhase':
      return handleAdvancePhase(state)
    case 'setEdge':
      return handleSetEdge(state, playerId, action.targetPlayerId)
    case 'adjustUncontrolledBlood':
      return handleAdjustUncontrolledBlood(state, playerId, action.minionInstanceId, action.delta)
    case 'influence':
      return handleInfluence(state, playerId, action.minionInstanceId)
    case 'toggleTorpor':
      return handleToggleTorpor(state, playerId, action.minionInstanceId)
    case 'playFromHand':
      return handlePlayFromHand(state, playerId, action.indices)
    case 'trashFromPlay':
      return handleTrashFromPlay(state, playerId, action.instanceIds)
  }
}

export { applyGameAction }
export type { HandlerResult }
