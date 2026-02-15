'use client'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import CardRow from './CardRow'

type PlayerHandProps = {
  hand: string[]
  showImages?: boolean
  onPlay?: (indices: number[]) => void
}

const PlayerHand = ({ hand, showImages, onPlay }: PlayerHandProps) => {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [expandedHand, setExpandedHand] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    setExpandedHand((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handlePlay = () => {
    onPlay?.([...selected].sort())
    setSelected(new Set())
  }

  return (
    <CardRow
      title={`Hand (${hand.length})`}
      actions={
        <Button variant="contained" size="small" disabled={selected.size === 0} onClick={handlePlay}>
          Play ({selected.size})
        </Button>
      }
    >
      {hand.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No cards in hand.
        </Typography>
      ) : (
        hand.map((cardId, index) => {
          const card = getCardById(cardId)
          const isSelected = selected.has(index)
          return (
            <Tooltip
              key={`${cardId}-${index}`}
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
                  onClick={() => toggle(index)}
                  sx={{
                    width: 120,
                    aspectRatio: '48/67',
                    borderRadius: 0.5,
                    display: 'block',
                    cursor: 'pointer',
                    outline: isSelected ? '3px solid' : 'none',
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
                          toggleExpanded(index)
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
                            transform: expandedHand.has(index) ? 'rotate(180deg)' : 'none',
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
                    onClick={() => toggle(index)}
                    sx={{
                      p: 1,
                      minWidth: 120,
                      maxWidth: 200,
                      cursor: 'pointer',
                      borderColor: isSelected
                        ? 'primary.main'
                        : card?.type === 'crypt'
                          ? 'warning.main'
                          : 'success.main',
                      borderWidth: 2,
                      bgcolor: isSelected ? 'action.selected' : undefined,
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
                      <Collapse in={expandedHand.has(index)}>
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
        })
      )}
    </CardRow>
  )
}

export default PlayerHand
