import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { getGame } from '$/actions/game-actions'
import PublicGameContent from '$/components/game/PublicGameContent'

type PublicGamePageProps = {
  params: Promise<{ gameId: string }>
  searchParams: Promise<{ gfx?: string }>
}

const PublicGamePage = async ({ params, searchParams }: PublicGamePageProps) => {
  const { gameId } = await params
  const { gfx } = await searchParams

  const result = await getGame(gameId)
  if (!result.success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Game not found.</Typography>
      </Container>
    )
  }

  return <PublicGameContent gameId={gameId} initialState={result.data} gfx={gfx} />
}

export default PublicGamePage
