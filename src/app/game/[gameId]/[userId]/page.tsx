import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGameView } from '$/actions/game-actions'
import GameBoard from '$/components/game/GameBoard'
import GamePoller from '$/components/game/GamePoller'

type PlayerGamePageProps = {
  params: Promise<{ gameId: string; userId: string }>
}

const PlayerGamePage = async ({ params }: PlayerGamePageProps) => {
  const { gameId, userId } = await params

  const result = await getGameView(gameId, userId)
  if (!result.success) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{result.error}</Typography>
      </Container>
    )
  }

  return (
    <GamePoller>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {result.data.name}
        </Typography>
        <GameBoard gameView={result.data} />
      </Container>
    </GamePoller>
  )
}

export default PlayerGamePage
