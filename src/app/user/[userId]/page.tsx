import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createDeck, getUserDecks } from '$/actions/deck-actions'
import { getOrCreateUser } from '$/actions/user-actions'

type UserPageProps = {
  params: Promise<{ userId: string }>
}

const UserPage = async ({ params }: UserPageProps) => {
  const { userId } = await params

  const userResult = await getOrCreateUser(userId)
  if (!userResult.success) {
    return <Typography color="error">{userResult.error}</Typography>
  }

  const decksResult = await getUserDecks(userId)
  const decks = decksResult.success ? decksResult.data : []

  const handleCreateDeck = async () => {
    'use server'
    const result = await createDeck(userId, 'New Deck', '')
    if (result.success) {
      redirect(`/user/${userId}/deck/${result.data.id}`)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">{userResult.data.name}&apos;s Decks</Typography>
        <form action={handleCreateDeck}>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            New Deck
          </Button>
        </form>
      </Stack>

      {decks.length === 0 ? (
        <Typography color="text.secondary">No decks yet. Create one to get started!</Typography>
      ) : (
        <Stack spacing={2}>
          {decks.map((deck) => {
            const cryptCount = deck.crypt.reduce((sum, e) => sum + e.count, 0)
            const libraryCount = deck.library.reduce((sum, e) => sum + e.count, 0)
            return (
              <Link
                key={deck.id}
                href={`/user/${userId}/deck/${deck.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card variant="outlined">
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="h6">{deck.name}</Typography>
                      {deck.description && (
                        <Typography variant="body2" color="text.secondary">
                          {deck.description}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Crypt: {cryptCount} | Library: {libraryCount}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            )
          })}
        </Stack>
      )}
    </Container>
  )
}

export default UserPage
