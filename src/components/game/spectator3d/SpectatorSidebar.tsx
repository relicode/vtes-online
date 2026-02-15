'use client'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ActionLog from '$/components/game/ActionLog'
import type { GameSummary } from '$/types/game'

type SpectatorSidebarProps = {
  game: GameSummary
  focusedPlayerId?: string
  onFocusPlayer: (playerId: string | undefined) => void
}

const SpectatorSidebar = ({ game, focusedPlayerId, onFocusPlayer }: SpectatorSidebarProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    {/* Game status */}
    <Box sx={{ p: 2, pb: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {game.name}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} size="small" />
        <Chip label={`Round ${game.round}`} variant="outlined" size="small" />
        <Chip label={`Turn ${game.turnCount}`} variant="outlined" size="small" />
      </Stack>
    </Box>

    {/* Player buttons */}
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Players
      </Typography>
      <Stack spacing={0.5}>
        {game.players.map((player) => {
          const isFocused = focusedPlayerId === player.playerId
          return (
            <Button
              key={player.playerId}
              variant={isFocused ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onFocusPlayer(isFocused ? undefined : player.playerId)}
              sx={{
                justifyContent: 'space-between',
                textTransform: 'none',
                opacity: player.ousted ? 0.5 : 1,
              }}
            >
              <span>{player.name}</span>
              <Avatar sx={{ bgcolor: 'error.main', width: 22, height: 22, fontSize: 11, ml: 1 }}>{player.pool}</Avatar>
            </Button>
          )
        })}
      </Stack>
    </Box>

    {/* Action log */}
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2 }}>
      <ActionLog entries={game.actionLog} />
    </Box>
  </Box>
)

export default SpectatorSidebar
