'use client'

import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
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

import CardTypeIcon from '$/components/CardTypeIcon'
import ClanIcon from '$/components/ClanIcon'
import { getCardById } from '$/data/cards'
import useLongPress from '$/hooks/useLongPress'
import type { LibraryCardInPlay as LibraryCardInPlayType } from '$/types/game'

type LibraryCardInPlayProps = {
  libraryCard: LibraryCardInPlayType
  selected?: boolean
  showImages?: boolean
  targetName?: string
  onSelect?: (instanceId: string) => void
  onLongPress?: (instanceId: string) => void
  onToggleLock?: (instanceId: string) => void
  onAdjustLife?: (instanceId: string, delta: number) => void
}

const LibraryCardInPlayComponent = ({
  libraryCard,
  selected,
  showImages,
  targetName,
  onSelect,
  onLongPress,
  onToggleLock,
  onAdjustLife,
}: LibraryCardInPlayProps) => {
  const [expanded, setExpanded] = useState(false)
  const cardLongPress = useLongPress({
    onPress: () => onSelect?.(libraryCard.instanceId),
    onLongPress: () => onLongPress?.(libraryCard.instanceId),
  })
  const card = getCardById(libraryCard.cardId)
  const name = card?.name ?? 'Unknown'
  const isAllyOrRetainer = card?.type === 'library' && card.types.some((t) => t === 'Ally' || t === 'Retainer')
  const badgeBorderColor = selected ? 'primary.main' : 'success.main'

  const lifeBadge = isAllyOrRetainer ? (
    <Stack direction="row" spacing={0} alignItems="center" sx={{ bgcolor: 'error.main', borderRadius: 3, px: 0.25 }}>
      <IconButton
        size="small"
        disabled={libraryCard.counters <= 0}
        onClick={() => onAdjustLife?.(libraryCard.instanceId, -1)}
        sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
      >
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography variant="caption" sx={{ color: 'error.contrastText', fontWeight: 'bold', mx: 0.25 }}>
        {libraryCard.counters}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onAdjustLife?.(libraryCard.instanceId, 1)}
        sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  ) : undefined

  const cardContent = (
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
          {...cardLongPress}
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
                  border: 2,
                  borderColor: badgeBorderColor,
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
            {...cardLongPress}
            sx={{
              p: 1.5,
              maxWidth: 200,
              cursor: 'pointer',
              borderColor: selected ? 'primary.main' : 'success.main',
              borderWidth: 2,
              bgcolor: selected ? 'action.selected' : undefined,
            }}
          >
            <Typography variant="subtitle2">{name}</Typography>
            {card?.type === 'library' && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                {card.types.map((t) => (
                  <CardTypeIcon key={t} type={t} size={32} />
                ))}
                {card.clans?.map((clan) => (
                  <ClanIcon key={clan} clan={clan} size={32} />
                ))}
                {card.bloodCost !== undefined && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {card.bloodCost} blood
                  </Typography>
                )}
                {card.poolCost !== undefined && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {card.poolCost} pool
                  </Typography>
                )}
              </Stack>
            )}
            {targetName && (
              <Stack direction="row" sx={{ mt: 0.5 }}>
                <Chip icon={<GpsFixedIcon />} label={targetName} size="small" color="error" variant="outlined" />
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
  )

  const badgeSlotProps = { badge: { style: { boxShadow: 'none', padding: 0, minWidth: 0 } } }

  const inner = lifeBadge ? (
    <Badge
      badgeContent={lifeBadge}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        badge: {
          style: { boxShadow: 'none', padding: 0, minWidth: 0, left: '50%', transform: 'translate(-50%, 50%)' },
        },
      }}
    >
      {cardContent}
    </Badge>
  ) : (
    cardContent
  )

  return (
    <Box>
      <Badge
        badgeContent={
          <IconButton
            size="small"
            onClick={() => onToggleLock?.(libraryCard.instanceId)}
            sx={{
              p: 0.25,
              bgcolor: libraryCard.locked ? 'warning.dark' : 'success.dark',
              '&:hover': { bgcolor: libraryCard.locked ? 'warning.main' : 'success.main' },
              borderRadius: '50%',
            }}
          >
            {libraryCard.locked ? (
              <LockIcon sx={{ fontSize: 20, color: 'warning.contrastText' }} />
            ) : (
              <LockOpenIcon sx={{ fontSize: 20, color: 'success.contrastText' }} />
            )}
          </IconButton>
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={badgeSlotProps}
      >
        {inner}
      </Badge>
    </Box>
  )
}

export default LibraryCardInPlayComponent
