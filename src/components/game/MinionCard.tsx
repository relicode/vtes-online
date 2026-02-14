'use client'

import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'
import type { MinionInPlay } from '$/types/game'

type MinionCardProps = {
  minion: MinionInPlay
}

const MinionCard = ({ minion }: MinionCardProps) => {
  const card = getCardById(minion.cardId)
  const name = card?.name ?? 'Unknown'

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        opacity: minion.locked ? 0.6 : 1,
        transform: minion.locked ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <Typography variant="subtitle2">{name}</Typography>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <Chip label={`Blood: ${minion.counters}`} size="small" color="error" variant="outlined" />
        {minion.locked && <Chip label="Locked" size="small" />}
        {minion.inTorpor && <Chip label="Torpor" size="small" color="warning" />}
      </Stack>
    </Paper>
  )
}

export default MinionCard
