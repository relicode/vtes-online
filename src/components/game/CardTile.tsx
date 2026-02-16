'use client'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
import type { Card } from '$/types/card'

type CardTileProps = {
  card: Card | undefined
  cardId: string
  showImages: boolean
  selected?: boolean
  onClick?: () => void
}

const CardTile = ({ card, cardId, showImages, selected, onClick }: CardTileProps) => {
  const [expanded, setExpanded] = useState(false)

  const borderColor = selected ? 'primary.main' : card?.type === 'crypt' ? 'warning.main' : 'success.main'

  return (
    <Tooltip
      enterDelay={2000}
      enterNextDelay={2000}
      placement="left"
      title={card ? <Box component="img" src={card.url} alt={card.name} sx={{ width: 250 }} /> : ''}
      slotProps={{ tooltip: { sx: { bgcolor: 'transparent', p: 0 } } }}
    >
      {showImages ? (
        <Box
          component="img"
          src={card?.url}
          alt={card?.name ?? cardId}
          onClick={onClick}
          sx={{
            width: 120,
            aspectRatio: '48/67',
            borderRadius: 0.5,
            display: 'block',
            cursor: onClick ? 'pointer' : undefined,
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
                  borderColor,
                }}
              >
                <ExpandMoreIcon
                  sx={{
                    fontSize: 20,
                    color: borderColor,
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
            onClick={onClick}
            sx={{
              p: 1,
              minWidth: 120,
              maxWidth: 200,
              cursor: onClick ? 'pointer' : undefined,
              borderColor,
              borderWidth: 2,
              bgcolor: selected ? 'action.selected' : undefined,
            }}
          >
            <Typography variant="body2">{card?.name ?? cardId}</Typography>
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
}

export default CardTile
