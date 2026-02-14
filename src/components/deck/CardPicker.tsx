'use client'

import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { getCryptCards, getLibraryCards } from '$/data/cards'
import type { Card } from '$/types/card'

type CardPickerProps = {
  onAddCard: (cardId: string) => void
}

const CardPicker = ({ onAddCard }: CardPickerProps) => {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')

  const cards: Card[] = tab === 0 ? getCryptCards() : getLibraryCards()
  const filtered = search ? cards.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : cards

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Add Cards
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Crypt" />
        <Tab label="Library" />
      </Tabs>
      <TextField
        size="small"
        fullWidth
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
      />
      <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filtered.map((card) => (
          <ListItem
            key={card.id}
            secondaryAction={
              <IconButton edge="end" size="small" onClick={() => onAddCard(card.id)}>
                <AddIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemText
              primary={card.name}
              secondaryTypographyProps={{ component: 'span' }}
              secondary={
                <Stack component="span" direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                  {card.type === 'crypt' ? (
                    <>
                      <Chip label={card.clan} size="small" variant="outlined" />
                      <Chip label={`Cap: ${card.capacity}`} size="small" variant="outlined" />
                      <Chip label={`G${card.group}`} size="small" variant="outlined" />
                    </>
                  ) : (
                    <>
                      <Chip label={card.cardType} size="small" variant="outlined" />
                      {card.discipline && <Chip label={card.discipline} size="small" variant="outlined" />}
                    </>
                  )}
                </Stack>
              }
            />
          </ListItem>
        ))}
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No cards found.
          </Typography>
        )}
      </List>
    </Box>
  )
}

export default CardPicker
