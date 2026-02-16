'use client'

import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import debounce from 'lodash-es/debounce'
import { useRef, useState, useTransition } from 'react'

import CardTypeIcon from '$/components/CardTypeIcon'
import ClanIcon, { allClans } from '$/components/ClanIcon'
import DisciplineIcon from '$/components/DisciplineIcon'
import { getCryptCards, getLibraryCards } from '$/data/cards'
import type { LibraryCardType } from '$/types/card'
import CardPreviewModal from './CardPreviewModal'

const libraryTypes: LibraryCardType[] = [
  'Action',
  'Action Modifier',
  'Ally',
  'Combat',
  'Conviction',
  'Equipment',
  'Event',
  'Master',
  'Political Action',
  'Power',
  'Reaction',
  'Retainer',
]

type CardPickerProps = {
  onAddCard: (cardId: string) => void
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const inlineBadge = { '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }
const neutralBadge = {
  '& .MuiBadge-badge': { position: 'relative', transform: 'none', bgcolor: 'grey.600', color: 'common.white' },
}

const CardPicker = ({ onAddCard }: CardPickerProps) => {
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSetSearch = useRef(debounce(setSearch, 500)).current
  const [groupRange, setGroupRange] = useState<string>('any')
  const [clanFilter, setClanFilter] = useState<string>('any')
  const [libraryType, setLibraryType] = useState<string>('any')
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()

  const cards = tab === 0 ? getCryptCards() : getLibraryCards()
  const normalizedSearch = search ? normalize(search) : ''
  const filtered = cards.filter((c) => {
    if (normalizedSearch && !normalize(c.name).includes(normalizedSearch)) return false
    if (c.type === 'crypt') {
      if (groupRange !== 'any') {
        const [lo, hi] = groupRange.split('-').map(Number)
        if (c.group < lo || c.group > hi) return false
      }
      if (clanFilter !== 'any' && !c.clans.some((cl) => cl === clanFilter)) return false
    }
    if (libraryType !== 'any' && c.type === 'library') {
      if (!c.types.some((t) => t === libraryType)) return false
    }
    return true
  })

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Add Cards
      </Typography>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Tabs value={tab} onChange={(_, v) => startTransition(() => setTab(v))}>
          <Tab label="Crypt" />
          <Tab label="Library" />
        </Tabs>
        <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
          {filtered.length}
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {tab === 0 && (
            <>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Group</InputLabel>
                <Select value={groupRange} onChange={(e) => setGroupRange(e.target.value)} label="Group">
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="1-2">1-2</MenuItem>
                  <MenuItem value="2-3">2-3</MenuItem>
                  <MenuItem value="3-4">3-4</MenuItem>
                  <MenuItem value="4-5">4-5</MenuItem>
                  <MenuItem value="5-6">5-6</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 60, ml: 1 }}>
                <InputLabel>Clan</InputLabel>
                <Select
                  value={clanFilter}
                  onChange={(e) => setClanFilter(e.target.value)}
                  label="Clan"
                  renderValue={(v) => (v === 'any' ? 'Any' : <ClanIcon clan={v as never} size={18} />)}
                  sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
                >
                  <MenuItem value="any">Any</MenuItem>
                  {allClans.map((clan) => (
                    <MenuItem key={clan} value={clan}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ClanIcon clan={clan} size={18} />
                        <span>{clan}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {tab === 1 && (
            <FormControl size="small" sx={{ minWidth: 60 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={libraryType}
                onChange={(e) => setLibraryType(e.target.value)}
                label="Type"
                renderValue={(v) => (v === 'any' ? 'Any' : <CardTypeIcon type={v as LibraryCardType} />)}
                sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
              >
                <MenuItem value="any">Any</MenuItem>
                {libraryTypes.map((t) => (
                  <MenuItem key={t} value={t}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CardTypeIcon type={t} />
                      <span>{t}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Stack>
      <TextField
        size="small"
        fullWidth
        placeholder="Search cards..."
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value)
          debouncedSetSearch(e.target.value)
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        sx={{ mb: 1 }}
      />
      <List dense sx={{ flex: 1, minHeight: 0, overflow: 'auto', pt: 1 }}>
        {filtered.map((card, i) => (
          <ListItem
            key={card.id}
            sx={{ bgcolor: i % 2 === 0 ? 'action.hover' : 'transparent' }}
            secondaryAction={
              <IconButton edge="end" size="small" onClick={() => onAddCard(card.id)}>
                <AddIcon fontSize="small" />
              </IconButton>
            }
          >
            <IconButton edge="start" size="small" onClick={() => setPreviewUrl(card.url)} sx={{ mr: 1 }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <ListItemText
              primary={
                <Stack component="span" direction="row" spacing={1} alignItems="center">
                  {card.type === 'crypt' && (
                    <>
                      <Badge badgeContent={`G${card.group}`} sx={neutralBadge} />
                      {card.clans.map((clan) => (
                        <ClanIcon key={clan} clan={clan} />
                      ))}
                      <Badge badgeContent={card.capacity} color="error" sx={inlineBadge} />
                    </>
                  )}
                  <span>{card.name}</span>
                </Stack>
              }
              secondaryTypographyProps={{ component: 'span' }}
              secondary={
                <Stack component="span" direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                  {card.type === 'crypt' ? (
                    card.disciplines?.map((d) => <DisciplineIcon key={d} discipline={d} />)
                  ) : (
                    <>
                      {card.types.map((t) => (
                        <CardTypeIcon key={t} type={t} />
                      ))}
                      {card.disciplines?.map((d) => (
                        <DisciplineIcon key={d} discipline={d} />
                      ))}
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
      <CardPreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(undefined)} />
    </Stack>
  )
}

export default CardPicker
