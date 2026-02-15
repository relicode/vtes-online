import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGame } from '$/actions/game-actions'
import Spectator3DContent from '$/components/game/spectator3d/Spectator3DContent'

type Game3DPageProps = {
  params: Promise<{ gameId: string }>
}

const Game3DPage = async ({ params }: Game3DPageProps) => {
  const { gameId } = await params

  const result = await getGame(gameId)
  if (!result.success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Game not found.</Typography>
      </Container>
    )
  }

  return <Spectator3DContent gameId={gameId} initialState={result.data} />
}

export default Game3DPage
