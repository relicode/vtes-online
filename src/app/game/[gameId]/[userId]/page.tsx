import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGame, getPlayerState } from '$/actions/game-actions'
import GameBoard from '$/components/game/GameBoard'
import GamePoller from '$/components/game/GamePoller'

type PlayerGamePageProps = {
  params: Promise<{ gameId: string; userId: string }>
}

const PlayerGamePage = async ({ params }: PlayerGamePageProps) => {
  const { gameId, userId } = await params

  const gameResult = await getGame(gameId)
  if (!gameResult.success) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Game not found.</Typography>
      </Container>
    )
  }

  const playerResult = await getPlayerState(gameId, userId)
  if (!playerResult.success) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">Player state not found.</Typography>
      </Container>
    )
  }

  return (
    <GamePoller>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {gameResult.data.name}
        </Typography>
        <GameBoard game={gameResult.data} playerState={playerResult.data} />
      </Container>
    </GamePoller>
  )
}

export default PlayerGamePage
