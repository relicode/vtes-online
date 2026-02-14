type GameStatus = 'waiting' | 'active' | 'finished'

type PlayerSummary = {
  userId: string
  name: string
  poolSize: number
  vampiresInPlay: number
}

type GamePublicState = {
  id: string
  name: string
  status: GameStatus
  players: PlayerSummary[]
  currentTurn: string
  turnNumber: number
  createdAt: string
}

type VampireInPlay = {
  cardId: string
  blood: number
  tapped: boolean
  attachments: string[]
}

type PlayerPrivateState = {
  userId: string
  gameId: string
  hand: string[]
  librarySize: number
  cryptSize: number
  pool: number
  vampiresInPlay: VampireInPlay[]
  uncontrolledRegion: string[]
}

export type { GamePublicState, GameStatus, PlayerPrivateState, PlayerSummary, VampireInPlay }
