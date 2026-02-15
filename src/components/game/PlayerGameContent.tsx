'use client'

import Box from '@mui/material/Box'

import type { GameView } from '$/types/game'
import GameBoard from './GameBoard'
import useGameEventStream from './GameEventStream'

type PlayerGameContentProps = {
  gameId: string
  playerId: string
  initialState: GameView
}

const PlayerGameContent = ({ gameId, playerId, initialState }: PlayerGameContentProps) => {
  const gameView = useGameEventStream({ gameId, userId: playerId, initialState })

  return (
    <Box sx={{ p: 2 }}>
      <GameBoard gameView={gameView} gameId={gameId} playerId={playerId} />
    </Box>
  )
}

export default PlayerGameContent
