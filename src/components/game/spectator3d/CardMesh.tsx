'use client'

import { Html, useTexture } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { Vector3 } from 'three'
import type { Group, Vector3Tuple } from 'three'

const CARD_WIDTH = 0.3
const CARD_HEIGHT = CARD_WIDTH * (67 / 48)

type CardMeshProps = {
  imageUrl: string
  position?: Vector3Tuple
  locked?: boolean
  counters?: number
  onCardClick?: (worldPos: Vector3Tuple) => void
}

const TexturedCard = ({ imageUrl, locked, counters }: CardMeshProps) => {
  const texture = useTexture(imageUrl)
  const lockY = locked ? (-25 * Math.PI) / 180 : 0

  return (
    <group rotation={[0, lockY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {counters !== undefined && counters > 0 && (
        <Html position={[CARD_WIDTH / 2 - 0.04, 0.02, CARD_HEIGHT / 2 - 0.04]} center>
          <div
            style={{
              background: '#d32f2f',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              pointerEvents: 'none',
            }}
          >
            {counters}
          </div>
        </Html>
      )}
    </group>
  )
}

const FallbackCard = () => (
  <mesh rotation={[-Math.PI / 2, Math.PI, 0]}>
    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
    <meshStandardMaterial color="#444" />
  </mesh>
)

const CardMesh = ({ imageUrl, position = [0, 0, 0], locked, counters, onCardClick }: CardMeshProps) => {
  const groupRef = useRef<Group>(null)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!onCardClick || !groupRef.current) return
    e.stopPropagation()
    const wp = groupRef.current.getWorldPosition(new Vector3())
    onCardClick([wp.x, wp.y, wp.z])
  }

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      <Suspense fallback={<FallbackCard />}>
        <TexturedCard imageUrl={imageUrl} locked={locked} counters={counters} />
      </Suspense>
    </group>
  )
}

export default CardMesh
export { CARD_WIDTH }
