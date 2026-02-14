'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'

type PlayerHandProps = {
  hand: string[]
}

const PlayerHand = ({ hand }: PlayerHandProps) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 1 }}>
      Hand ({hand.length})
    </Typography>
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {hand.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No cards in hand.
        </Typography>
      ) : (
        hand.map((cardId, index) => {
          const card = getCardById(cardId)
          return (
            <Paper key={`${cardId}-${index}`} variant="outlined" sx={{ p: 1, minWidth: 120 }}>
              <Typography variant="body2">{card?.name ?? cardId}</Typography>
              {card && (
                <Chip
                  label={card.type === 'crypt' ? 'Crypt' : card.cardType}
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
  </Box>
)

export default PlayerHand
