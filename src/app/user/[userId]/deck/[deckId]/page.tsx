import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { deleteDeck, getDeck } from '$/actions/deck-actions'
import DeckEditor from '$/components/deck/DeckEditor'

type DeckPageProps = {
  params: Promise<{ userId: string; deckId: string }>
}

const DeckPage = async ({ params }: DeckPageProps) => {
  const { userId, deckId } = await params

  const result = await getDeck(deckId)
  if (!result.success) {
    return (
      <Stack sx={{ p: 4 }}>
        <Typography color="error">Deck not found.</Typography>
        <Link href={`/user/${userId}`} style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Back to Decks
          </Button>
        </Link>
      </Stack>
    )
  }

  const handleDelete = async () => {
    'use server'
    await deleteDeck(deckId, userId)
    redirect(`/user/${userId}`)
  }

  return (
    <Stack sx={{ flex: 1 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 3, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Link href={`/user/${userId}`} style={{ textDecoration: 'none' }}>
          <Button startIcon={<ArrowBackIcon />}>Back to Decks</Button>
        </Link>
        <form action={handleDelete}>
          <Button type="submit" color="error" startIcon={<DeleteIcon />}>
            Delete Deck
          </Button>
        </form>
      </Stack>
      <DeckEditor deck={result.data} />
    </Stack>
  )
}

export default DeckPage
