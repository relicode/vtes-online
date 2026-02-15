'use client'

import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { getCardById } from '$/data/cards'

type PlayerHandProps = {
  hand: string[]
  onPlay?: (indices: number[]) => void
}

const PlayerHand = ({ hand, onPlay }: PlayerHandProps) => {
  const [selected, setSelected] = useState<Set<number>>(new Set())

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
    <div>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
        <Typography variant="h5" textAlign="center">Hand ({hand.length})</Typography>
        <Button variant="contained" size="small" disabled={selected.size === 0} onClick={handlePlay}>
          Play ({selected.size})
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {hand.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No cards in hand.
          </Typography>
        ) : (
          hand.map((cardId, index) => {
            const card = getCardById(cardId)
            const isSelected = selected.has(index)
            return (
              <Paper
                key={`${cardId}-${index}`}
                variant="outlined"
                onClick={() => toggle(index)}
                sx={{
                  p: 1,
                  minWidth: 120,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : card?.type === 'crypt' ? 'warning.main' : 'success.main',
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? 'action.selected' : undefined,
                }}
              >
                <Typography variant="body2">{card?.name ?? cardId}</Typography>
                {card && (
                  <Chip
                    label={card.type === 'crypt' ? 'Crypt' : card.types.join(' / ')}
                    size="small"
                    sx={{ mt: 0.5 }}
                    variant="outlined"
                  />
                )}
              </Paper>
            )
          })
        )}
      </Stack>
    </div>
  )
}

export default PlayerHand
