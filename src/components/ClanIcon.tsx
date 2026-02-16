import type { Clan } from '$/types/card'

const clanFile: Record<Clan, string> = {
  Abomination: 'abominations',
  Ahrimane: 'ahrimanes',
  Akunanse: 'akunanse',
  Assamite: 'assamite',
  Avenger: 'avenger',
  Baali: 'baali',
  'Blood Brother': 'bloodbrothers',
  Brujah: 'brujah',
  'Brujah antitribu': 'brujahantitribu',
  Caitiff: 'caitiff',
  'Daughter of Cacophony': 'daughtersofcacophony',
  Defender: 'defender',
  'Follower of Set': 'followersofset',
  Gangrel: 'gangrel',
  'Gangrel antitribu': 'gangrelantitribu',
  Gargoyle: 'gargoyles',
  Giovanni: 'giovanni',
  Guruhi: 'guruhi',
  'Harbinger of Skulls': 'harbingersofskulls',
  Innocent: 'innocent',
  Ishtarri: 'ishtarri',
  Judge: 'judge',
  Kiasyd: 'kiasyd',
  Lasombra: 'lasombra',
  Malkavian: 'malkavian',
  'Malkavian antitribu': 'malkavianantitribu',
  Martyr: 'martyr',
  Nagaraja: 'nagaraja',
  Nosferatu: 'nosferatu',
  'Nosferatu antitribu': 'nosferatuantitribu',
  Osebo: 'osebo',
  Pander: 'pander',
  Ravnos: 'ravnos',
  Redeemer: 'redeemer',
  Salubri: 'salubri',
  'Salubri antitribu': 'salubriantitribu',
  Samedi: 'samedi',
  Toreador: 'toreador',
  'Toreador antitribu': 'toreadorantitribu',
  Tremere: 'tremere',
  'Tremere antitribu': 'tremereantitribu',
  'True Brujah': 'truebrujah',
  Tzimisce: 'tzimisce',
  Ventrue: 'ventrue',
  'Ventrue antitribu': 'ventrueantitribu',
  Visionary: 'visionary',
}

type ClanIconProps = {
  clan: Clan
  size?: number
}

const ClanIcon = ({ clan, size = 20 }: ClanIconProps) => (
  // eslint-disable-next-line @next/next/no-img-element -- small static SVG icons don't benefit from next/image optimization
  <img src={`/clans/${clanFile[clan]}.svg`} alt={clan} title={clan} width={size} height={size} />
)

const allClans = Object.keys(clanFile) as Clan[]

export default ClanIcon
export { allClans }
