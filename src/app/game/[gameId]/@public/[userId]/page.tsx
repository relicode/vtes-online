import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGame } from '$/actions/game-actions'
import PublicGameContent from '$/components/game/PublicGameContent'

type PublicPlayerGamePageProps = {
  params: Promise<{ gameId: string }>
}

const PublicPlayerGamePage = async ({ params }: PublicPlayerGamePageProps) => {
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

export default PublicPlayerGamePage
