'use client'

import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'
import type { VampireInPlay } from '$/types/game'

type VampireCardProps = {
  vampire: VampireInPlay
}

const VampireCard = ({ vampire }: VampireCardProps) => {
  const card = getCardById(vampire.cardId)
  const name = card?.name ?? 'Unknown'

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        opacity: vampire.tapped ? 0.6 : 1,
        transform: vampire.tapped ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <Typography variant="subtitle2">{name}</Typography>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <Chip label={`Blood: ${vampire.blood}`} size="small" color="error" variant="outlined" />
        {vampire.tapped && <Chip label="Tapped" size="small" />}
        {vampire.attachments.length > 0 && (
          <Chip label={`${vampire.attachments.length} attached`} size="small" variant="outlined" />
        )}
      </Stack>
    </Paper>
  )
}

export default VampireCard
