import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getGame } from '$/actions/game-actions'
import GamePoller from '$/components/game/GamePoller'

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

  const game = result.data

  return (
    <GamePoller>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {game.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} />
          <Chip label={`Turn ${game.turnNumber}`} variant="outlined" />
          <Chip label={`${game.players.length} players`} variant="outlined" />
        </Stack>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Players
        </Typography>
        <Stack spacing={1}>
          {game.players.map((player) => (
            <Paper key={player.userId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">{player.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`Pool: ${player.poolSize}`} size="small" variant="outlined" />
                  <Chip label={`Vampires: ${player.vampiresInPlay}`} size="small" variant="outlined" />
                  {game.currentTurn === player.userId && <Chip label="Active" size="small" color="primary" />}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </GamePoller>
  )
}

export default GamePage
