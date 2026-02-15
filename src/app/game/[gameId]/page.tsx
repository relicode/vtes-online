import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGame } from '$/actions/game-actions'
import PublicGameContent from '$/components/game/PublicGameContent'

type GamePageProps = {
  params: Promise<{ gameId: string }>
}

const GamePage = async ({ params }: GamePageProps) => {
  const { gameId } = await params

  const result = await getGame(gameId)
  if (!result.success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Game not found.</Typography>
      </Container>
    )
  }

  return <PublicGameContent gameId={gameId} initialState={result.data} />
}

export default GamePage
