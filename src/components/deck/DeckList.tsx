'use client'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getCardById } from '$/data/cards'
import type { DeckCardEntry } from '$/types/user'

type DeckListProps = {
  title: string
  entries: DeckCardEntry[]
  onRemove: (cardId: string) => void
  onUpdateCount: (cardId: string, count: number) => void
}

const DeckList = ({ title, entries, onRemove, onUpdateCount }: DeckListProps) => {
  const totalCards = entries.reduce((sum, e) => sum + e.count, 0)

  const handleDecrement = (entry: DeckCardEntry) => {
    if (entry.count <= 1) {
      onRemove(entry.cardId)
    } else {
      onUpdateCount(entry.cardId, entry.count - 1)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title} ({totalCards})
      </Typography>
      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No cards added yet.
        </Typography>
      ) : (
        <List dense>
          {entries.map((entry) => {
            const card = getCardById(entry.cardId)
            return (
              <ListItem key={entry.cardId} disablePadding sx={{ py: 0.25 }}>
                <Stack direction="row" spacing={0.25} alignItems="center" sx={{ mr: 1 }}>
                  <IconButton size="small" onClick={() => handleDecrement(entry)}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                    {entry.count}
                  </Typography>
                  <IconButton size="small" onClick={() => onUpdateCount(entry.cardId, entry.count + 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <ListItemText primary={card?.name ?? entry.cardId} />
              </ListItem>
            )
          })}
        </List>
      )}
    </Box>
  )
}

export default DeckList
