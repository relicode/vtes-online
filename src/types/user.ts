type User = {
  id: string
  name: string
  createdAt: string
}

type DeckCardEntry = {
  cardId: string
  count: number
}

type Deck = {
  id: string
  userId: string
  name: string
  description: string
  crypt: DeckCardEntry[]
  library: DeckCardEntry[]
  createdAt: string
  updatedAt: string
}

export type { Deck, DeckCardEntry, User }
