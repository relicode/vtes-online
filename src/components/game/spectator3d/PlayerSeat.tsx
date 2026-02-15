'use client'

import { Html } from '@react-three/drei'

import { getCardById } from '$/data/cards'
import type { PublicPlayerView } from '$/types/game'

import type { Vector3Tuple } from 'three'

import CardMesh, { CARD_WIDTH } from './CardMesh'

type PlayerSeatProps = {
  player: PublicPlayerView
  position: [number, number, number]
  rotation: number
  isActive: boolean
  onCardClick?: (worldPos: Vector3Tuple) => void
}

const CARD_GAP = CARD_WIDTH + 0.05
const CARD_Y = 0.02
const LIBRARY_ROW_OFFSET = -2.3
const MINION_ROW_OFFSET = -1.6
const UNCONTROLLED_OFFSET = -1.0

const centerOffset = (count: number) => ((count - 1) * CARD_GAP) / -2

const PlayerSeat = ({ player, position, rotation, isActive, onCardClick }: PlayerSeatProps) => {
  const allMinions = [
    ...player.minions.map((m) => ({
      instanceId: m.instanceId,
      imageUrl: getCardById(m.cardId)?.url ?? '/cards/cardbackcrypt.jpg',
      locked: m.locked,
      counters: m.counters,
    })),
    ...player.libraryCardsInPlay.flatMap((c) => {
      const card = getCardById(c.cardId)
      if (card?.type !== 'library' || !card.types.includes('Ally')) return []
      return {
        instanceId: c.instanceId,
        imageUrl: card.url ?? '/cards/cardbackcrypt.jpg',
        locked: c.locked,
        counters: c.counters,
      }
    }),
  ]

  const libraryInPlay = player.libraryCardsInPlay.flatMap((c) => {
    const card = getCardById(c.cardId)
    if (card?.type !== 'library' || card.types.includes('Ally')) return []
    return { ...c, imageUrl: card.url ?? '/cards/cardbackcrypt.jpg' }
  })

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Player info overlay */}
      <Html position={[0, 0.8, 0.3]} center>
        <div
          style={{
            background: isActive ? 'rgba(46, 125, 50, 0.9)' : 'rgba(30, 30, 30, 0.85)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            border: isActive ? '1px solid #66bb6a' : '1px solid rgba(255,255,255,0.15)',
            opacity: player.ousted ? 0.4 : 1,
          }}
        >
          <div style={{ fontWeight: 700 }}>{player.name}</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>
            Pool: {player.pool} | Hand: {player.handSize} | Lib: {player.librarySize} | Crypt: {player.cryptSize}
          </div>
        </div>
      </Html>

      {/* Front row: minions */}
      {allMinions.map((m, i) => (
        <CardMesh
          key={m.instanceId}
          imageUrl={m.imageUrl}
          position={[centerOffset(allMinions.length) + i * CARD_GAP, CARD_Y, MINION_ROW_OFFSET]}
          locked={m.locked}
          counters={m.counters}
          onCardClick={onCardClick}
        />
      ))}

      {/* Back row: library cards in play */}
      {libraryInPlay.map((c, i) => (
        <CardMesh
          key={c.instanceId}
          imageUrl={c.imageUrl}
          position={[centerOffset(libraryInPlay.length) + i * CARD_GAP, CARD_Y, LIBRARY_ROW_OFFSET]}
          locked={c.locked}
          counters={c.counters > 0 ? c.counters : undefined}
          onCardClick={onCardClick}
        />
      ))}

      {/* Side: uncontrolled minions (card back) */}
      {player.uncontrolled.map((u, i) => (
        <CardMesh
          key={u.instanceId}
          imageUrl="/cards/cardbackcrypt.jpg"
          position={[centerOffset(player.uncontrolled.length) + i * CARD_GAP, CARD_Y, UNCONTROLLED_OFFSET]}
          counters={u.blood > 0 ? u.blood : undefined}
          onCardClick={onCardClick}
        />
      ))}
    </group>
  )
}

export default PlayerSeat
