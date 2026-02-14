type Discipline =
  | 'Animalism'
  | 'Auspex'
  | 'Celerity'
  | 'Dominate'
  | 'Fortitude'
  | 'Obfuscate'
  | 'Potence'
  | 'Presence'
  | 'Protean'
  | 'Thaumaturgy'
  | 'Necromancy'
  | 'Obtenebration'
  | 'Serpentis'
  | 'Chimerstry'
  | 'Dementation'
  | 'Quietus'
  | 'Vicissitude'
  | 'Valeren'
  | 'Spiritus'
  | 'Temporis'
  | 'Abombwe'
  | 'Sanguinus'
  | 'Thanatosis'
  | 'Daimoinon'
  | 'Melpominee'
  | 'Mytherceria'
  | 'Obeah'
  | 'Visceratika'

type Clan =
  | 'Brujah'
  | 'Gangrel'
  | 'Malkavian'
  | 'Nosferatu'
  | 'Toreador'
  | 'Tremere'
  | 'Ventrue'
  | 'Lasombra'
  | 'Tzimisce'
  | 'Assamite'
  | 'Followers of Set'
  | 'Giovanni'
  | 'Ravnos'
  | 'Baali'
  | 'Daughters of Cacophony'
  | 'Harbingers of Skulls'
  | 'Kiasyd'
  | 'Nagaraja'
  | 'Salubri'
  | 'Samedi'
  | 'True Brujah'
  | 'Gargoyle'
  | 'Ahrimane'
  | 'Blood Brother'
  | 'Caitiff'
  | 'Pander'

type Sect = 'Camarilla' | 'Sabbat' | 'Independent' | 'Laibon' | 'Anarch'

type CryptCard = {
  id: string
  name: string
  type: 'crypt'
  clan: Clan
  capacity: number
  disciplines: Discipline[]
  group: number
  sect: Sect
  text: string
}

type LibraryCardType =
  | 'Action'
  | 'Action Modifier'
  | 'Ally'
  | 'Combat'
  | 'Equipment'
  | 'Event'
  | 'Master'
  | 'Political Action'
  | 'Reaction'
  | 'Retainer'

type LibraryCard = {
  id: string
  name: string
  type: 'library'
  cardType: LibraryCardType
  clan?: Clan
  discipline?: Discipline
  poolCost?: number
  bloodCost?: number
  text: string
}

type Card = CryptCard | LibraryCard

export type { Card, Clan, CryptCard, Discipline, LibraryCard, LibraryCardType, Sect }
