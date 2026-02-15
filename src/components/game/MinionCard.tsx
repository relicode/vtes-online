'use client'

import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import RemoveIcon from '@mui/icons-material/Remove'
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
  selected?: boolean
  onSelect?: (instanceId: string) => void
  onToggleLock?: (instanceId: string) => void
  onAdjustBlood?: (instanceId: string, delta: number) => void
}

const MinionCard = ({ minion, selected, onSelect, onToggleLock, onAdjustBlood }: MinionCardProps) => {
  const card = getCardById(minion.cardId)
  const name = card?.name ?? 'Unknown'
  const capacity = card?.type === 'crypt' ? card.capacity : 0
  const bloodLabel = `${minion.counters}/${capacity}`

  return (
    <Box sx={{ transform: minion.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s' }}>
      <Badge
        badgeContent={
          <IconButton
            size="small"
            onClick={() => onToggleLock?.(minion.instanceId)}
            sx={{ p: 0.25, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' }, borderRadius: '50%' }}
          >
            {minion.locked ? (
              <LockIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            ) : (
              <LockOpenIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            )}
          </IconButton>
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 } },
        }}
      >
        <Badge
          badgeContent={
            <Stack direction="row" spacing={0} alignItems="center" sx={{ bgcolor: 'error.main', borderRadius: 3, px: 0.25 }}>
              <IconButton size="small" disabled={minion.counters <= 0} onClick={() => onAdjustBlood?.(minion.instanceId, -1)} sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}>
                <RemoveIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'error.contrastText', fontWeight: 'bold', mx: 0.25 }}>{bloodLabel}</Typography>
              <IconButton size="small" disabled={minion.counters >= capacity} onClick={() => onAdjustBlood?.(minion.instanceId, 1)} sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}>
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0, left: '50%', transform: 'translate(-50%, 50%)' } },
          }}
        >
          <Paper
            variant="outlined"
            onClick={() => onSelect?.(minion.instanceId)}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              borderColor: selected ? 'primary.main' : card?.type === 'crypt' ? 'warning.main' : 'success.main',
              borderWidth: 2,
              bgcolor: selected ? 'action.selected' : undefined,
            }}
          >
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
