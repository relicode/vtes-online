import type { LibraryCardType } from '$/types/card'

const typeFile: Record<LibraryCardType, string> = {
  Action: 'action',
  'Action Modifier': 'modifier',
  Ally: 'ally',
  Combat: 'combat',
  Conviction: 'conviction',
  Equipment: 'equipment',
  Event: 'event',
  Master: 'master',
  'Political Action': 'political',
  Power: 'power',
  Reaction: 'reaction',
  Retainer: 'retainer',
}

type CardTypeIconProps = {
  type: LibraryCardType
  size?: number
}

const CardTypeIcon = ({ type, size = 18 }: CardTypeIconProps) => (
  // eslint-disable-next-line @next/next/no-img-element -- small static SVG icons don't benefit from next/image optimization
  <img src={`/types/${typeFile[type]}.svg`} alt={type} title={type} width={size} height={size} />
)

export default CardTypeIcon
