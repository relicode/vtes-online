// ---------------------------------------------------------------------------
// View types (sent to clients)
// ---------------------------------------------------------------------------

import type { ActionLogEntry } from './game-actions'

// ---------------------------------------------------------------------------
// Card-in-play instances
// ---------------------------------------------------------------------------

type ControlledCryptCard = {
  instanceId: string
  cardId: string
  owner: string
  controller: string
  counters: number // blood (vampires) or life (imbued)
  locked: boolean
  inTorpor: boolean
  attachedTo?: string // instanceId of another card in play
  target?: string // instanceId of the targeted card
}

type UncontrolledCryptCard = {
  instanceId: string
  cardId: string // hidden from opponents
  owner: string
  blood: number
}

type UncontrolledCryptCardPublic = {
  instanceId: string
  blood: number
}

type LibraryCardInPlay = {
  instanceId: string
  cardId: string
  owner: string
  controller: string
  attachedTo?: string // instanceId of card this is attached to (e.g. equipped minion)
  counters: number
  locked: boolean
  target?: string // instanceId of the targeted card
}

// ---------------------------------------------------------------------------
// Player state
// ---------------------------------------------------------------------------

type PlayerState = {
  playerId: string
  deckId: string
  name: string
  pool: number

  // Hidden zones (card ID strings, order matters)
  library: string[] // draw pile, index 0 = top
  crypt: string[] // crypt draw pile, index 0 = top
  hand: string[]

  // Visible zones
  ashHeap: string[] // burned/discarded cards
  removed: string[] // cards removed from game entirely

  // In-play areas
  controlledCrypt: ControlledCryptCard[]
  libraryCardsInPlay: LibraryCardInPlay[]
  uncontrolledCrypt: UncontrolledCryptCard[]

  // Status
  ousted: boolean
  victoryPoints: number
}

// ---------------------------------------------------------------------------
// Turn state machine
// ---------------------------------------------------------------------------

type TurnPhase = 'unlock' | 'master' | 'minion' | 'influence' | 'discard'

type ActionType = 'bleed' | 'hunt' | 'equip' | 'recruit' | 'political' | 'other'

type ActionSubPhase = 'declaring' | 'blocking' | 'combat' | 'resolving'

type CombatStep = 'before-range' | 'determine-range' | 'strike' | 'resolve-strikes' | 'press' | 'end'

type CombatRange = 'close' | 'long'

type CombatState = {
  attackerInstanceId: string
  defenderInstanceId: string
  round: number
  step: CombatStep
  range: CombatRange
}

type VoteState = {
  actionCardInstanceId: string
  callerInstanceId: string
  votes: Record<string, number> // playerId → positive=for, negative=against
  currentVoter: string
  votingOrder: string[]
}

type ActionState = {
  actingMinionInstanceId: string
  actionCardInstanceId?: string
  actionType: ActionType
  targetPlayerId?: string
  targetMinionInstanceId?: string
  subPhase: ActionSubPhase
  blockingPlayerId?: string
  blockerMinionInstanceId?: string
  combat?: CombatState
  vote?: VoteState
}

type TurnState = {
  activePlayer: string
  phase: TurnPhase
  action?: ActionState
}

// ---------------------------------------------------------------------------
// Contested cards
// ---------------------------------------------------------------------------

type ContestedCard = {
  cardName: string
  controllers: Record<string, string> // playerId → instanceId
}

// ---------------------------------------------------------------------------
// Game state (authoritative, stored in Redis as game:{gameId})
// ---------------------------------------------------------------------------

type GameStatus = 'waiting' | 'active' | 'finished'

type GameState = {
  id: string
  name: string
  status: GameStatus
  createdAt: string

  playerOrder: string[] // clockwise seating; ousted players stay, skipped in turns

  // Turn tracking
  round: number // complete rounds played (starts 0)
  turnCount: number // absolute individual turns taken
  influenceCounter: number // ramp: 1, 2, 3, 4, 4, 4...
  turn: TurnState

  // Shared objects
  edge: { heldBy?: string }
  contestedCards: ContestedCard[]

  // All player state
  players: Record<string, PlayerState>
}

export type { ActionLogEntry }

type PublicPlayerView = {
  playerId: string
  name: string
  pool: number

  librarySize: number
  cryptSize: number
  handSize: number

  ashHeap: string[]
  removed: string[]

  controlledCrypt: ControlledCryptCard[]
  libraryCardsInPlay: LibraryCardInPlay[]
  uncontrolledCrypt: UncontrolledCryptCardPublic[]

  ousted: boolean
  victoryPoints: number
}

type GameView = {
  id: string
  name: string
  status: GameStatus
  createdAt: string

  playerOrder: string[]
  round: number
  turnCount: number
  influenceCounter: number
  turn: TurnState

  edge: { heldBy?: string }
  contestedCards: ContestedCard[]

  self: PlayerState
  opponents: PublicPlayerView[]
  actionLog: ActionLogEntry[]
}

type GameSummary = {
  id: string
  name: string
  status: GameStatus
  playerCount: number
  players: PublicPlayerView[]
  round: number
  turnCount: number
  activePlayer: string
  phase: TurnPhase
  actionLog: ActionLogEntry[]
}

type GameListItem = {
  id: string
  name: string
  status: GameStatus
  players: { playerId: string; name: string }[]
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export type {
  ActionState,
  ActionSubPhase,
  ActionType,
  CombatRange,
  CombatState,
  CombatStep,
  ContestedCard,
  GameListItem,
  GameState,
  GameStatus,
  GameSummary,
  GameView,
  LibraryCardInPlay,
  ControlledCryptCard,
  PublicPlayerView,
  PlayerState,
  TurnPhase,
  TurnState,
  UncontrolledCryptCard,
  UncontrolledCryptCardPublic,
  VoteState,
}
