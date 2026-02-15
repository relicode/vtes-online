'use client'

import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'

import type { GameSummary } from '$/types/game'
import useGameEventStream from './GameEventStream'

type PublicGameContentProps = {
  gameId: string
  initialState: GameSummary
}

const PublicGameContent = ({ gameId, initialState }: PublicGameContentProps) => {
  const game = useGameEventStream({ gameId, initialState })

  useEffect(() => {
    document.title = game.name
  }, [game.name])

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={1}>
        <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} />
        <Chip label={`Round ${game.round} / Turn ${game.turnCount}`} variant="outlined" />
        <Chip label={`${game.playerCount} players`} variant="outlined" />
      </Stack>

      <Stack spacing={1}>
        {game.players.map((player) => (
          <Paper key={player.playerId} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">{player.name}</Typography>
                {game.activePlayer === player.playerId && <Chip label={game.phase} size="small" color="primary" />}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Chip label={`Pool: ${player.pool}`} size="small" variant="outlined" />
                <Chip label={`Minions: ${player.minions.length}`} size="small" variant="outlined" />
              </Stack>
            </Stack>
            {player.uncontrolled.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                {player.uncontrolled.map((u) => (
                  <Badge
                    key={u.instanceId}
                    badgeContent={u.blood}
                    color="error"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    slotProps={{
                      badge: {
                        style: { fontSize: 10, minWidth: 20, height: 20, borderRadius: '50%', padding: 0 },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/cards/cardbackcrypt.jpg"
                      alt="Uncontrolled"
                      sx={{ width: 48, height: 67, borderRadius: 0.5, display: 'block' }}
                    />
                  </Badge>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default PublicGameContent
