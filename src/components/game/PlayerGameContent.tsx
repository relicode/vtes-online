'use client'

import type { GameView } from '$/types/game'
import useGameEventStream from './GameEventStream'
import PlayerPlayArea from './PlayerPlayArea'

type PlayerGameContentProps = {
  gameId: string
  playerId: string
  initialState: GameView
}

const PlayerGameContent = ({ gameId, playerId, initialState }: PlayerGameContentProps) => {
  const gameView = useGameEventStream({ gameId, userId: playerId, initialState })

  return <PlayerPlayArea gameView={gameView} gameId={gameId} playerId={playerId} />
}

export default PlayerGameContent
