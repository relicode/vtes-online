import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGameView } from '$/actions/game-actions'
import PlayerGameContent from '$/components/game/PlayerGameContent'

type StandalonePlayerPageProps = {
  params: Promise<{ gameId: string; userId: string }>
}

const StandalonePlayerPage = async ({ params }: StandalonePlayerPageProps) => {
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
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <PlayerGameContent gameId={gameId} playerId={userId} initialState={result.data} />
    </Box>
  )
}

export default StandalonePlayerPage
