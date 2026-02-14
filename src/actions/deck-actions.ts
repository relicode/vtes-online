'use server'

import redis from '$/lib/redis'
import type { ActionResult } from '$/types/actions'
import type { Deck, DeckCardEntry } from '$/types/user'

const getDeck = async (deckId: string): Promise<ActionResult<Deck>> => {
  const raw = await redis.get(`deck:${deckId}`)
  if (!raw) {
    return { success: false, error: 'Deck not found' }
  }
  return { success: true, data: JSON.parse(raw) as Deck }
}

const getUserDecks = async (userId: string): Promise<ActionResult<Deck[]>> => {
  const deckIds = await redis.smembers(`user:${userId}:decks`)
  if (deckIds.length === 0) {
    return { success: true, data: [] }
  }

  const pipeline = redis.pipeline()
  for (const id of deckIds) {
    pipeline.get(`deck:${id}`)
  }
  const results = await pipeline.exec()

  const decks = (results ?? [])
    .map(([err, raw]) => {
      if (err || !raw) return null
      return JSON.parse(raw as string) as Deck
    })
    .filter((d): d is Deck => d !== null)

  return { success: true, data: decks }
}

const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000

const createDeck = async (userId: string, name: string, description: string): Promise<ActionResult<Deck>> => {
  const trimmedName = name.trim()
  if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
    return { success: false, error: 'Deck name is required and must be under 200 characters' }
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { success: false, error: 'Description must be under 2000 characters' }
  }

  const deckId = crypto.randomUUID()
  const now = new Date().toISOString()

  const deck: Deck = {
    id: deckId,
    userId,
    name: trimmedName,
    description: description.trim(),
    crypt: [],
    library: [],
    createdAt: now,
    updatedAt: now,
  }

  await redis.pipeline().set(`deck:${deckId}`, JSON.stringify(deck)).sadd(`user:${userId}:decks`, deckId).exec()

  return { success: true, data: deck }
}

const saveDeck = async (
  deckId: string,
  userId: string,
  updates: {
    name?: string
    description?: string
    crypt?: DeckCardEntry[]
    library?: DeckCardEntry[]
  }
): Promise<ActionResult<Deck>> => {
  const raw = await redis.get(`deck:${deckId}`)
  if (!raw) {
    return { success: false, error: 'Deck not found' }
  }

  const deck = JSON.parse(raw) as Deck
  if (deck.userId !== userId) {
    return { success: false, error: 'Not authorized to edit this deck' }
  }

  const updated: Deck = {
    ...deck,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await redis.set(`deck:${deckId}`, JSON.stringify(updated))
  return { success: true, data: updated }
}

const deleteDeck = async (deckId: string, userId: string): Promise<ActionResult<null>> => {
  const raw = await redis.get(`deck:${deckId}`)
  if (!raw) {
    return { success: false, error: 'Deck not found' }
  }

  const deck = JSON.parse(raw) as Deck
  if (deck.userId !== userId) {
    return { success: false, error: 'Not authorized to delete this deck' }
  }

  await redis.pipeline().del(`deck:${deckId}`).srem(`user:${userId}:decks`, deckId).exec()

  return { success: true, data: null }
}

export { createDeck, deleteDeck, getDeck, getUserDecks, saveDeck }
