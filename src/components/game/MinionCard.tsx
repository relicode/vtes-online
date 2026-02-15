'use client'

import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'
import type { MinionInPlay } from '$/types/game'

type MinionCardProps = {
  minion: MinionInPlay
  onToggleLock?: (instanceId: string) => void
}

const MinionCard = ({ minion, onToggleLock }: MinionCardProps) => {
  const card = getCardById(minion.cardId)
  const name = card?.name ?? 'Unknown'
  const capacity = card?.type === 'crypt' ? card.capacity : 0
  const bloodLabel = `${minion.counters}/${capacity}`

  return (
    <Box sx={{ transform: minion.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s' }}>
      <Badge
        badgeContent={bloodLabel}
        color="error"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ badge: { style: { fontSize: 10, minWidth: 24, height: 24, borderRadius: '50%', padding: 0 } } }}
      >
        <Badge
          badgeContent={
            <IconButton size="small" onClick={() => onToggleLock?.(minion.instanceId)} sx={{ p: 0 }}>
              {minion.locked ? (
                <LockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              ) : (
                <LockOpenIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              )}
            </IconButton>
          }
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 } },
          }}
        >
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="subtitle2">{name}</Typography>
            {minion.inTorpor && (
              <Stack direction="row" sx={{ mt: 0.5 }}>
                <Chip label="Torpor" size="small" color="warning" />
              </Stack>
            )}
          </Paper>
        </Badge>
      </Badge>
    </Box>
  )
}

export default MinionCard
