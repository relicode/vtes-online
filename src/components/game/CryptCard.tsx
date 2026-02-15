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
import DisciplineIcon from '$/components/DisciplineIcon'
import { getCardById } from '$/data/cards'
import type { ControlledCryptCard, UncontrolledCryptCard } from '$/types/game'

// ---------------------------------------------------------------------------
// Shared base
// ---------------------------------------------------------------------------

type CryptCardBaseProps = {
  instanceId: string
  cardId: string
  blood: number
  locked?: boolean
  inTorpor?: boolean
  selected?: boolean
  showImages?: boolean
  onSelect?: (instanceId: string) => void
  onToggleLock?: (instanceId: string) => void
  onAdjustBlood?: (instanceId: string, delta: number) => void
}

const CryptCardBase = ({
  instanceId,
  cardId,
  blood,
  locked,
  inTorpor,
  selected,
  showImages,
  onSelect,
  onToggleLock,
  onAdjustBlood,
}: CryptCardBaseProps) => {
  const [expanded, setExpanded] = useState(false)
  const card = getCardById(cardId)
  const name = card?.name ?? 'Unknown'
  const capacity = card?.type === 'crypt' ? card.capacity : 0
  const clans = card?.type === 'crypt' ? card.clans : []
  const bloodLabel = `${blood}/${capacity}`

  const bloodBadge = (
    <Stack direction="row" spacing={0} alignItems="center" sx={{ bgcolor: 'error.main', borderRadius: 3, px: 0.25 }}>
      <IconButton
        size="small"
        disabled={blood <= 0}
        onClick={() => onAdjustBlood?.(instanceId, -1)}
        sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
      >
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography variant="caption" sx={{ color: 'error.contrastText', fontWeight: 'bold', mx: 0.25 }}>
        {bloodLabel}
      </Typography>
      <IconButton
        size="small"
        disabled={blood >= capacity}
        onClick={() => onAdjustBlood?.(instanceId, 1)}
        sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  )

  const badgeBorderColor = selected ? 'primary.main' : 'warning.main'

  const clanBadge =
    clans.length > 0 ? (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderRadius: '50%',
          p: 0.25,
          border: 2,
          borderColor: badgeBorderColor,
        }}
      >
        {clans.map((clan) => (
          <ClanIcon key={clan} clan={clan} size={20} />
        ))}
      </Box>
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
          onClick={() => onSelect?.(instanceId)}
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
          slotProps={{ badge: { style: { boxShadow: 'none', padding: 0, minWidth: 0 } } }}
        >
          <Paper
            variant="outlined"
            onClick={() => onSelect?.(instanceId)}
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
            {card?.type === 'crypt' && (card.title || card.adv) && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                {card.title && (
                  <Typography variant="caption" color="text.secondary">
                    {card.title}
                  </Typography>
                )}
                {card.adv && <Chip label="ADV" size="small" color="info" sx={{ height: 18, fontSize: 10 }} />}
              </Stack>
            )}
            {card?.type === 'crypt' && card.disciplines.length > 0 && (
              <Stack direction="row" spacing={0.25} alignItems="center" useFlexGap sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                {card.disciplines.map((d) => (
                  <DisciplineIcon key={d} discipline={d} size={18} />
                ))}
              </Stack>
            )}
            {inTorpor && (
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
  )

  const badgeSlotProps = { badge: { style: { boxShadow: 'none', padding: 0, minWidth: 0 } } }
  const bloodBadgeSlotProps = {
    badge: {
      style: { boxShadow: 'none', padding: 0, minWidth: 0, left: '50%', transform: 'translate(-50%, 50%)' },
    },
  }

  const inner = (
    <Badge badgeContent={bloodBadge} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={bloodBadgeSlotProps}>
      <Badge badgeContent={clanBadge} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={badgeSlotProps}>
        {cardContent}
      </Badge>
    </Badge>
  )

  return (
    <Box>
      {locked !== undefined ? (
        <Badge
          badgeContent={
            <IconButton
              size="small"
              onClick={() => onToggleLock?.(instanceId)}
              sx={{
                p: 0.25,
                bgcolor: locked ? 'warning.dark' : 'success.dark',
                '&:hover': { bgcolor: locked ? 'warning.main' : 'success.main' },
                borderRadius: '50%',
              }}
            >
              {locked ? (
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
      ) : (
        inner
      )}
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type CryptCardProps = {
  selected?: boolean
  showImages?: boolean
  onSelect?: (instanceId: string) => void
  onAdjustBlood?: (instanceId: string, delta: number) => void
} & (
  | { controlled: true; cryptCard: ControlledCryptCard; onToggleLock?: (instanceId: string) => void }
  | { controlled: false; cryptCard: UncontrolledCryptCard; onToggleLock?: never }
)

const CryptCard = (props: CryptCardProps) => {
  const { cryptCard, controlled, selected, showImages, onSelect, onAdjustBlood } = props

  return (
    <CryptCardBase
      instanceId={cryptCard.instanceId}
      cardId={cryptCard.cardId}
      blood={controlled ? cryptCard.counters : cryptCard.blood}
      locked={controlled ? cryptCard.locked : undefined}
      inTorpor={controlled ? cryptCard.inTorpor : undefined}
      selected={selected}
      showImages={showImages}
      onSelect={onSelect}
      onToggleLock={controlled ? props.onToggleLock : undefined}
      onAdjustBlood={onAdjustBlood}
    />
  )
}

export default CryptCard
