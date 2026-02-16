'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'
import CardTile from './CardTile'

type PlayerHandProps = {
  hand: string[]
  showImages?: boolean
  selectedHand: Set<number>
  onToggleHandCard: (index: number) => void
}

const PlayerHand = ({ hand, showImages, selectedHand: selected, onToggleHandCard: toggle }: PlayerHandProps) => (
  <Stack direction="row" sx={{ gap: 4, flexWrap: 'wrap', alignItems: 'flex-start' }}>
    {hand.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No cards in hand.
      </Typography>
    ) : (
      hand.map((cardId, index) => (
        <CardTile
          key={`${cardId}-${index}`}
          card={getCardById(cardId)}
          cardId={cardId}
          showImages={showImages ?? false}
          selected={selected.has(index)}
          onClick={() => toggle(index)}
        />
      ))
    )}
  </Stack>
)

export default PlayerHand
