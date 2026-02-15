type Clan =
  | 'Abomination'
  | 'Ahrimane'
  | 'Akunanse'
  | 'Assamite'
  | 'Avenger'
  | 'Baali'
  | 'Blood Brother'
  | 'Brujah'
  | 'Brujah antitribu'
  | 'Caitiff'
  | 'Daughter of Cacophony'
  | 'Defender'
  | 'Follower of Set'
  | 'Gangrel'
  | 'Gangrel antitribu'
  | 'Gargoyle'
  | 'Giovanni'
  | 'Guruhi'
  | 'Harbinger of Skulls'
  | 'Innocent'
  | 'Ishtarri'
  | 'Judge'
  | 'Kiasyd'
  | 'Lasombra'
  | 'Malkavian'
  | 'Malkavian antitribu'
  | 'Martyr'
  | 'Nagaraja'
  | 'Nosferatu'
  | 'Nosferatu antitribu'
  | 'Osebo'
  | 'Pander'
  | 'Ravnos'
  | 'Redeemer'
  | 'Salubri'
  | 'Salubri antitribu'
  | 'Samedi'
  | 'Toreador'
  | 'Toreador antitribu'
  | 'Tremere'
  | 'Tremere antitribu'
  | 'True Brujah'
  | 'Tzimisce'
  | 'Ventrue'
  | 'Ventrue antitribu'
  | 'Visionary'

// Lowercase = inferior, UPPERCASE = superior
type Discipline =
  | 'abo'
  | 'ABO'
  | 'ani'
  | 'ANI'
  | 'aus'
  | 'AUS'
  | 'cel'
  | 'CEL'
  | 'chi'
  | 'CHI'
  | 'dai'
  | 'DAI'
  | 'def'
  | 'dem'
  | 'DEM'
  | 'dom'
  | 'DOM'
  | 'flight'
  | 'for'
  | 'FOR'
  | 'inn'
  | 'jud'
  | 'maleficia'
  | 'mar'
  | 'mel'
  | 'MEL'
  | 'myt'
  | 'MYT'
  | 'nec'
  | 'NEC'
  | 'obe'
  | 'OBE'
  | 'obf'
  | 'OBF'
  | 'obt'
  | 'OBT'
  | 'pot'
  | 'POT'
  | 'pre'
  | 'PRE'
  | 'pro'
  | 'PRO'
  | 'qui'
  | 'QUI'
  | 'red'
  | 'san'
  | 'SAN'
  | 'ser'
  | 'SER'
  | 'spi'
  | 'SPI'
  | 'striga'
  | 'tem'
  | 'TEM'
  | 'tha'
  | 'THA'
  | 'thn'
  | 'THN'
  | 'val'
  | 'VAL'
  | 'ven'
  | 'vic'
  | 'VIC'
  | 'vin'
  | 'vis'
  | 'VIS'

type CryptCard = {
  id: string
  name: string
  type: 'crypt'
  clans: Clan[]
  capacity: number
  disciplines: Discipline[]
  group: number
  cardText: string
  url: string
  title?: string
  adv?: boolean
}

type LibraryCardType =
  | 'Action'
  | 'Action Modifier'
  | 'Ally'
  | 'Combat'
  | 'Conviction'
  | 'Equipment'
  | 'Event'
  | 'Master'
  | 'Political Action'
  | 'Power'
  | 'Reaction'
  | 'Retainer'

type LibraryCard = {
  id: string
  name: string
  type: 'library'
  types: LibraryCardType[]
  cardText: string
  url: string
  clans?: Clan[]
  disciplines?: Discipline[]
  poolCost?: number
  bloodCost?: number
  life?: number
}

type Card = CryptCard | LibraryCard

export type { Card, Clan, CryptCard, Discipline, LibraryCard, LibraryCardType }
