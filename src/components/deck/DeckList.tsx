'use client'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import ClanIcon from '$/components/ClanIcon'
import DisciplineIcon from '$/components/DisciplineIcon'
import { getCardById } from '$/data/cards'
import type { DeckCardEntry } from '$/types/user'
import CardPreviewModal from './CardPreviewModal'

type DeckListProps = {
  title: string
  entries: DeckCardEntry[]
  onRemove: (cardId: string) => void
  onUpdateCount: (cardId: string, count: number) => void
}

const inlineBadge = { '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }
const neutralBadge = {
  '& .MuiBadge-badge': { position: 'relative', transform: 'none', bgcolor: 'grey.600', color: 'common.white' },
}

const DeckList = ({ title, entries, onRemove, onUpdateCount }: DeckListProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  const totalCards = entries.reduce((sum, e) => sum + e.count, 0)

  const avgCapacity =
    totalCards > 0
      ? entries.reduce((sum, e) => {
          const c = getCardById(e.cardId)
          return sum + (c?.type === 'crypt' ? c.capacity * e.count : 0)
        }, 0) / totalCards
      : 0

  const typeBreakdown = (() => {
    if (totalCards === 0) return []
    const counts: Record<string, number> = {}
    for (const e of entries) {
      const c = getCardById(e.cardId)
      if (c?.type === 'library') {
        for (const t of c.types) {
          counts[t] = (counts[t] ?? 0) + e.count
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([type, count]) => ({ type, pct: Math.round((count / totalCards) * 100) }))
  })()

  const handleDecrement = (entry: DeckCardEntry) => {
    if (entry.count <= 1) {
      onRemove(entry.cardId)
    } else {
      onUpdateCount(entry.cardId, entry.count - 1)
    }
  }

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title} ({totalCards}){avgCapacity > 0 && ` ~${avgCapacity.toFixed(1)}`}
      </Typography>
      {typeBreakdown.length > 0 && (
        <Stack sx={{ mb: 1 }}>
          {typeBreakdown.map(({ type, pct }) => (
            <Typography key={type} variant="body2" color="text.secondary">
              {type}: {pct}%
            </Typography>
          ))}
        </Stack>
      )}
      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No cards added yet.
        </Typography>
      ) : (
        <List dense sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {entries.map((entry, i) => {
            const card = getCardById(entry.cardId)
            return (
              <ListItem
                key={entry.cardId}
                disablePadding
                sx={{ py: 0.25, bgcolor: i % 2 === 0 ? 'action.hover' : 'transparent' }}
              >
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
                  <IconButton size="small" onClick={() => card?.url && setPreviewUrl(card.url)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {card?.type === 'crypt' && (
                        <>
                          <Badge badgeContent={`G${card.group}`} sx={neutralBadge} />
                          {card.clans.map((clan) => (
                            <ClanIcon key={clan} clan={clan} />
                          ))}
                          <Badge badgeContent={card.capacity} color="error" sx={inlineBadge} />
                        </>
                      )}
                      <span>{card?.name ?? entry.cardId}</span>
                    </Stack>
                  }
                  secondary={
                    card && 'disciplines' in card && card.disciplines?.length ? (
                      <Stack component="span" direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {card.disciplines.map((d) => (
                          <DisciplineIcon key={d} discipline={d} />
                        ))}
                      </Stack>
                    ) : undefined
                  }
                />
              </ListItem>
            )
          })}
        </List>
      )}
      <CardPreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(undefined)} />
    </Stack>
  )
}

export default DeckList
