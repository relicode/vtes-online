'use client'

import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import RemoveIcon from '@mui/icons-material/Remove'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import ClanIcon from '$/components/ClanIcon'
import { getCardById } from '$/data/cards'
import type { ControlledCryptCard } from '$/types/game'

type CryptCardInPlayProps = {
  cryptCard: ControlledCryptCard
  selected?: boolean
  showImages?: boolean
  onSelect?: (instanceId: string) => void
  onToggleLock?: (instanceId: string) => void
  onAdjustBlood?: (instanceId: string, delta: number) => void
}

const CryptCardInPlay = ({
  cryptCard,
  selected,
  showImages,
  onSelect,
  onToggleLock,
  onAdjustBlood,
}: CryptCardInPlayProps) => {
  const [expanded, setExpanded] = useState(false)
  const card = getCardById(cryptCard.cardId)
  const name = card?.name ?? 'Unknown'
  const capacity = card?.type === 'crypt' ? card.capacity : 0
  const bloodLabel = `${cryptCard.counters}/${capacity}`

  return (
    <Box>
      <Badge
        badgeContent={
          <IconButton
            size="small"
            onClick={() => onToggleLock?.(cryptCard.instanceId)}
            sx={{
              p: 0.25,
              bgcolor: cryptCard.locked ? 'warning.dark' : 'success.dark',
              '&:hover': { bgcolor: cryptCard.locked ? 'warning.main' : 'success.main' },
              borderRadius: '50%',
            }}
          >
            {cryptCard.locked ? (
              <LockIcon sx={{ fontSize: 20, color: 'warning.contrastText' }} />
            ) : (
              <LockOpenIcon sx={{ fontSize: 20, color: 'success.contrastText' }} />
            )}
          </IconButton>
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          badge: { style: { boxShadow: 'none', padding: 0, minWidth: 0 } },
        }}
      >
        <Badge
          badgeContent={
            <Stack
              direction="row"
              spacing={0}
              alignItems="center"
              sx={{ bgcolor: 'error.main', borderRadius: 3, px: 0.25 }}
            >
              <IconButton
                size="small"
                disabled={cryptCard.counters <= 0}
                onClick={() => onAdjustBlood?.(cryptCard.instanceId, -1)}
                sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
              >
                <RemoveIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <Typography variant="caption" sx={{ color: 'error.contrastText', fontWeight: 'bold', mx: 0.25 }}>
                {bloodLabel}
              </Typography>
              <IconButton
                size="small"
                disabled={cryptCard.counters >= capacity}
                onClick={() => onAdjustBlood?.(cryptCard.instanceId, 1)}
                sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          }
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            badge: {
              style: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                padding: 0,
                minWidth: 0,
                left: '50%',
                transform: 'translate(-50%, 50%)',
              },
            },
          }}
        >
          <Tooltip
            enterDelay={2000}
            enterNextDelay={2000}
            placement="left"
            title={card ? <Box component="img" src={card.url} alt={name} sx={{ width: 250 }} /> : ''}
            slotProps={{ tooltip: { sx: { bgcolor: 'transparent', p: 0 } } }}
          >
            {showImages ? (
              <Box
                component="img"
                src={card?.url}
                alt={name}
                onClick={() => onSelect?.(cryptCard.instanceId)}
                sx={{
                  width: 120,
                  aspectRatio: '48/67',
                  borderRadius: 0.5,
                  display: 'block',
                  cursor: 'pointer',
                  outline: selected ? '3px solid' : 'none',
                  outlineColor: 'primary.main',
                }}
              />
            ) : (
              <Badge
                badgeContent={
                  card?.cardText ? (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpanded((prev) => !prev)
                      }}
                      sx={{
                        p: 0.25,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' },
                        borderRadius: '50%',
                      }}
                    >
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 20,
                          color: 'text.secondary',
                          transform: expanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </IconButton>
                  ) : undefined
                }
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                  badge: { style: { boxShadow: 'none', padding: 0, minWidth: 0 } },
                }}
              >
                <Paper
                  variant="outlined"
                  onClick={() => onSelect?.(cryptCard.instanceId)}
                  sx={{
                    p: 1.5,
                    maxWidth: 200,
                    cursor: 'pointer',
                    borderColor: selected ? 'primary.main' : 'warning.main',
                    borderWidth: 2,
                    bgcolor: selected ? 'action.selected' : undefined,
                  }}
                >
                  <Typography variant="subtitle2">{name}</Typography>
                  {card?.type === 'crypt' && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                      {card.clans.map((clan) => (
                        <ClanIcon key={clan} clan={clan} size={32} />
                      ))}
                      {card.title && (
                        <Typography variant="caption" color="text.secondary">
                          {card.title}
                        </Typography>
                      )}
                      {card.adv && <Chip label="ADV" size="small" color="info" sx={{ height: 18, fontSize: 10 }} />}
                    </Stack>
                  )}
                  {cryptCard.inTorpor && (
                    <Stack direction="row" sx={{ mt: 0.5 }}>
                      <Chip label="Torpor" size="small" color="warning" />
                    </Stack>
                  )}
                  {card?.cardText && (
                    <Collapse in={expanded}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block', whiteSpace: 'pre-line' }}
                      >
                        {card.cardText}
                      </Typography>
                    </Collapse>
                  )}
                </Paper>
              </Badge>
            )}
          </Tooltip>
        </Badge>
      </Badge>
    </Box>
  )
}

export default CryptCardInPlay
