import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGameView } from '$/actions/game-actions'
import PlayerGameContent from '$/components/game/PlayerGameContent'

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

  return <PlayerGameContent gameId={gameId} playerId={userId} initialState={result.data} />
}

export default PlayerGamePage
