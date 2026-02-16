import type { Discipline } from '$/types/card'

const fileOverrides: Record<string, string> = {
  jud: 'jus',
  maleficia: 'mal',
  striga: 'str',
}

type DisciplineIconProps = {
  discipline: Discipline
  size?: number
}

const DisciplineIcon = ({ discipline, size = 16 }: DisciplineIconProps) => {
  const isSuper = discipline === discipline.toUpperCase() && discipline !== discipline.toLowerCase()
  const key = discipline.toLowerCase()
  const file = fileOverrides[key] ?? key
  const folder = isSuper ? 'sup' : 'inf'

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static SVG icons don't benefit from next/image optimization
    <img src={`/disciplines/${folder}/${file}.svg`} alt={discipline} title={discipline} width={size} height={size} />
  )
}

export default DisciplineIcon
