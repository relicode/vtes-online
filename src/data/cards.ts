import type { Card, Clan, CryptCard, Discipline, LibraryCard, LibraryCardType } from '$/types/card'
import rawCrypt from './crypt.json'
import rawLibrary from './library.json'

const localUrl = (url: string) => '/cards/' + url.split('/').pop()

const parseCost = (s: string): number => {
  const n = Number(s)
  return Number.isNaN(n) ? Infinity : n
}

const cryptCards: CryptCard[] = rawCrypt.map((c) => ({
  id: String(c.id),
  name: c.name,
  type: 'crypt' as const,
  clans: c.clans as Clan[],
  capacity: c.capacity,
  disciplines: c.disciplines as Discipline[],
  group: c.group ?? 0,
  cardText: c.cardText,
  url: localUrl(c.url),
  ...(c.title ? { title: c.title } : {}),
  ...(c.adv ? { adv: c.adv } : {}),
}))

const libraryCards: LibraryCard[] = rawLibrary.map((c) => ({
  id: String(c.id),
  name: c.name,
  type: 'library' as const,
  types: c.types as LibraryCardType[],
  cardText: c.card_text,
  url: localUrl(c.url),
  ...(c.clans ? { clans: c.clans as Clan[] } : {}),
  ...(c.disciplines ? { disciplines: c.disciplines as Discipline[] } : {}),
  ...(c.pool_cost ? { poolCost: parseCost(c.pool_cost) } : {}),
  ...(c.blood_cost ? { bloodCost: parseCost(c.blood_cost) } : {}),
}))

const cardMap = new Map<string, Card>([...cryptCards, ...libraryCards].map((card) => [card.id, card]))

const getCardById = (id: string) => cardMap.get(id)

const getCryptCards = () => cryptCards

const getLibraryCards = () => libraryCards

export { getCardById, getCryptCards, getLibraryCards }
