'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useActionState, useState } from 'react'

import { saveDeck } from '$/actions/deck-actions'
import { getCardById } from '$/data/cards'
import type { Deck, DeckCardEntry } from '$/types/user'
import CardPicker from './CardPicker'
import DeckList from './DeckList'

type DeckEditorProps = {
  deck: Deck
}

type SaveState = { message: string; error: boolean } | null

const DeckEditor = ({ deck: initialDeck }: DeckEditorProps) => {
  const [name, setName] = useState(initialDeck.name)
  const [description, setDescription] = useState(initialDeck.description)
  const [crypt, setCrypt] = useState<DeckCardEntry[]>(initialDeck.crypt)
  const [library, setLibrary] = useState<DeckCardEntry[]>(initialDeck.library)
  const [snackbar, setSnackbar] = useState<SaveState>(null)

  const saveAction = async (_previousState: SaveState): Promise<SaveState> => {
    const result = await saveDeck(initialDeck.id, initialDeck.userId, { name, description, crypt, library })
    const state: SaveState = result.success
      ? { message: 'Deck saved.', error: false }
      : { message: result.error, error: true }
    setSnackbar(state)
    return state
  }

  const [, formAction, isPending] = useActionState(saveAction, null)

  const addOrIncrement = (prev: DeckCardEntry[], cardId: string): DeckCardEntry[] => {
    const existing = prev.find((e) => e.cardId === cardId)
    if (existing) {
      return prev.map((e) => (e.cardId === cardId ? { ...e, count: e.count + 1 } : e))
    }
    return [...prev, { cardId, count: 1 }]
  }

  const handleAddCard = (cardId: string) => {
    const card = getCardById(cardId)
    if (!card) return

    if (card.type === 'crypt') {
      setCrypt((prev) => addOrIncrement(prev, cardId))
    } else {
      setLibrary((prev) => addOrIncrement(prev, cardId))
    }
  }

  const handleRemoveCrypt = (cardId: string) => {
    setCrypt((prev) => prev.filter((e) => e.cardId !== cardId))
  }

  const handleRemoveLibrary = (cardId: string) => {
    setLibrary((prev) => prev.filter((e) => e.cardId !== cardId))
  }

  const handleUpdateCryptCount = (cardId: string, count: number) => {
    setCrypt((prev) => prev.map((e) => (e.cardId === cardId ? { ...e, count } : e)))
  }

  const handleUpdateLibraryCount = (cardId: string, count: number) => {
    setLibrary((prev) => prev.map((e) => (e.cardId === cardId ? { ...e, count } : e)))
  }

  const cryptTotal = crypt.reduce((sum, e) => sum + e.count, 0)
  const libraryTotal = library.reduce((sum, e) => sum + e.count, 0)

  const cryptValid = cryptTotal === 12
  const libraryValid = libraryTotal >= 60 && libraryTotal <= 90

  const validationErrors: string[] = []
  if (cryptTotal !== 12) {
    validationErrors.push(`Crypt must be exactly 12 cards (currently ${cryptTotal})`)
  }
  if (libraryTotal < 60) {
    validationErrors.push(`Library needs at least 60 cards (currently ${libraryTotal})`)
  }
  if (libraryTotal > 90) {
    validationErrors.push(`Library cannot exceed 90 cards (currently ${libraryTotal})`)
  }

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Container maxWidth="lg" sx={{ py: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">Edit Deck</Typography>
          <Typography variant="body2" color={cryptValid ? 'success.main' : 'error.main'}>
            Crypt: {cryptTotal}
          </Typography>
          <Typography variant="body2" color={libraryValid ? 'success.main' : 'error.main'}>
            Library: {libraryTotal}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField label="Deck Name" value={name} onChange={(e) => setName(e.target.value)} size="small" />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
        </Stack>
      </Container>

      <Stack direction="row" spacing={3} sx={{ flex: 1, minHeight: 0, px: 3, pb: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <CardPicker onAddCard={handleAddCard} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <DeckList title="Crypt" entries={crypt} onRemove={handleRemoveCrypt} onUpdateCount={handleUpdateCryptCount} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <DeckList
            title="Library"
            entries={library}
            onRemove={handleRemoveLibrary}
            onUpdateCount={handleUpdateLibraryCount}
          />
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <form action={formAction}>
          <Button type="submit" variant="contained" disabled={isPending || validationErrors.length > 0}>
            {isPending ? 'Saving...' : 'Save Deck'}
          </Button>
        </form>
        {validationErrors.length > 0 && (
          <Alert severity="warning" sx={{ flex: 1 }}>
            {validationErrors.join('. ')}.
          </Alert>
        )}
      </Stack>

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbar?.error ? 'error' : 'success'} variant="filled">
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default DeckEditor
