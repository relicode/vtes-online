'use client'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {gameView.name}
      </Typography>
      <GameBoard gameView={gameView} gameId={gameId} playerId={playerId} />
    </Container>
  )
}

export default PlayerGameContent
