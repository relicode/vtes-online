// ---------------------------------------------------------------------------
// Game actions — discriminated union on `type`
// ---------------------------------------------------------------------------

type DrawFromLibrary = { type: 'drawFromLibrary'; count?: number }
type DrawFromCrypt = { type: 'drawFromCrypt'; count?: number }
type ToggleLock = { type: 'toggleLock'; instanceId: string }
type AdjustMinionCounters = { type: 'adjustMinionCounters'; minionInstanceId: string; delta: number }
type AdjustPool = { type: 'adjustPool'; delta: number }
type MoveCard = {
  type: 'moveCard'
  cardId: string
  from: CardZone
  to: CardZone
  index?: number
}
type AdvancePhase = { type: 'advancePhase' }
type SetEdge = { type: 'setEdge'; targetPlayerId?: string }
type AdjustUncontrolledBlood = { type: 'adjustUncontrolledBlood'; minionInstanceId: string; delta: number }
type Influence = { type: 'influence'; minionInstanceId: string }
type ToggleTorpor = { type: 'toggleTorpor'; minionInstanceId: string }
type PlayFromHand = { type: 'playFromHand'; indices: number[] }
type TrashFromPlay = { type: 'trashFromPlay'; instanceIds: string[] }

type GameAction =
  | DrawFromLibrary
  | DrawFromCrypt
  | ToggleLock
  | AdjustMinionCounters
  | AdjustPool
  | MoveCard
  | AdvancePhase
  | SetEdge
  | AdjustUncontrolledBlood
  | Influence
  | ToggleTorpor
  | PlayFromHand
  | TrashFromPlay

type CardZone = 'hand' | 'ashHeap' | 'library' | 'crypt' | 'removed'

// ---------------------------------------------------------------------------
// Action log entry (stored in Redis list, sent to clients)
// ---------------------------------------------------------------------------

type ActionLogEntry = {
  id: string
  timestamp: string
  playerId: string
  playerName: string
  type: GameAction['type']
  description: string
}

export type { ActionLogEntry, CardZone, GameAction }
