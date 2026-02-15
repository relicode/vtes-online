'use client'

import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { GameSummary } from '$/types/game'
import useGameEventStream from './GameEventStream'

type PublicGameContentProps = {
  gameId: string
  initialState: GameSummary
}

const PublicGameContent = ({ gameId, initialState }: PublicGameContentProps) => {
  const game = useGameEventStream({ gameId, initialState })

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {game.name}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} />
        <Chip label={`Round ${game.round} / Turn ${game.turnCount}`} variant="outlined" />
        <Chip label={`${game.playerCount} players`} variant="outlined" />
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Players
      </Typography>
      <Stack spacing={1}>
        {game.players.map((player) => (
          <Paper key={player.playerId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">{player.name}</Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={`Pool: ${player.pool}`} size="small" variant="outlined" />
                <Chip label={`Vampires: ${player.vampiresInPlay}`} size="small" variant="outlined" />
                {game.activePlayer === player.playerId && <Chip label="Active" size="small" color="primary" />}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Container>
  )
}

export default PublicGameContent
