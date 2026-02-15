'use client'

import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, Vector3, type Vector3Tuple } from 'three'

import type { GameSummary } from '$/types/game'
import PlayerSeat from './PlayerSeat'
import { computeSeatLayouts } from './table-geometry'
import TableMesh from './TableMesh'

type SpectatorSceneProps = {
  game: GameSummary
  focusedPlayerId?: string
}

const DEFAULT_CAMERA: [number, number, number] = [0, 8, 8]
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0]

const createMarbleTexture = () => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Dark marble base
  ctx.fillStyle = '#2a2a30'
  ctx.fillRect(0, 0, size, size)

  // Broad colour variation
  for (let i = 0; i < 20; i++) {
    const gx = Math.random() * size
    const gy = Math.random() * size
    const gr = 60 + Math.random() * 100
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    const tone = Math.random() > 0.5 ? 'rgba(50,48,55,' : 'rgba(34,32,38,'
    grad.addColorStop(0, tone + (0.3 + Math.random() * 0.3) + ')')
    grad.addColorStop(1, tone + '0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }

  // Veins
  for (let v = 0; v < 16; v++) {
    ctx.beginPath()
    const bright = 70 + Math.random() * 40
    ctx.strokeStyle = `rgba(${bright}, ${bright - 5}, ${bright + 10}, ${0.15 + Math.random() * 0.25})`
    ctx.lineWidth = 0.5 + Math.random() * 2

    let x = Math.random() * size
    let y = Math.random() * size
    ctx.moveTo(x, y)
    for (let s = 0; s < 100; s++) {
      x += (Math.random() - 0.5) * 16
      y += (Math.random() - 0.5) * 16 + 1.5
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Fine noise for stone grain
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const a = 0.02 + Math.random() * 0.05
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`
    ctx.fillRect(x, y, 1, 1)
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(4, 4)
  texture.colorSpace = SRGBColorSpace
  return texture
}

const MarbleFloor = () => {
  const texRef = useRef<CanvasTexture | undefined>(undefined)
  if (!texRef.current) texRef.current = createMarbleTexture()

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={texRef.current} roughness={0.4} metalness={0.15} />
    </mesh>
  )
}

const Scene = ({ game, focusedPlayerId }: SpectatorSceneProps) => {
  const cameraRef = useRef<CameraControls>(null)
  const gameRef = useRef(game)
  gameRef.current = game

  useEffect(() => {
    const controls = cameraRef.current
    if (!controls) return

    if (!focusedPlayerId) {
      controls.setLookAt(...DEFAULT_CAMERA, ...DEFAULT_TARGET, true)
      return
    }

    const g = gameRef.current
    const index = g.players.findIndex((p) => p.playerId === focusedPlayerId)
    if (index === -1) return

    const seats = computeSeatLayouts(g.players.length)
    const seat = seats[index]
    controls.setLookAt(...seat.cameraPosition, ...seat.cameraTarget, true)
  }, [focusedPlayerId])

  useEffect(() => {
    const controls = cameraRef.current
    if (!controls) return

    // Left-click pans, right-click rotates
    controls.mouseButtons.left = 2 // ACTION.TRUCK
    controls.mouseButtons.right = 1 // ACTION.ROTATE

    const pressed = new Set<string>()
    const PAN_SPEED = 0.05
    const FORWARD_SPEED = 0.05

    const onKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX'].includes(e.code)) {
        e.preventDefault()
        pressed.add(e.code)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => pressed.delete(e.code)

    let frameId: number
    const tick = () => {
      if (pressed.has('KeyW')) controls.forward(FORWARD_SPEED, false)
      if (pressed.has('KeyS')) controls.forward(-FORWARD_SPEED, false)
      if (pressed.has('KeyA')) controls.truck(-PAN_SPEED, 0, false)
      if (pressed.has('KeyD')) controls.truck(PAN_SPEED, 0, false)
      if (pressed.has('KeyZ')) controls.dolly(FORWARD_SPEED, false)
      if (pressed.has('KeyX')) controls.dolly(-FORWARD_SPEED, false)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(frameId)
    }
  }, [])

  const handleCardClick = (worldPos: Vector3Tuple) => {
    const controls = cameraRef.current
    if (!controls) return

    // Offset camera slightly outward from center for a stable up vector
    const len = Math.sqrt(worldPos[0] * worldPos[0] + worldPos[2] * worldPos[2])
    const nx = len > 0 ? worldPos[0] / len : 0
    const nz = len > 0 ? worldPos[2] / len : 1
    const camX = worldPos[0] + nx * 0.15
    const camZ = worldPos[2] + nz * 0.15

    // Animate in Cartesian space to avoid azimuth-wrap spinning
    const startPos = controls.camera.position.clone()
    const startTarget = controls.getTarget(new Vector3())
    const endPos = new Vector3(camX, 1.5, camZ)
    const endTarget = new Vector3(...worldPos)

    const duration = 600
    const startTime = performance.now()

    const animate = () => {
      const t = Math.min((performance.now() - startTime) / duration, 1)
      const e = 1 - (1 - t) ** 3 // easeOutCubic
      const p = startPos.clone().lerp(endPos, e)
      const tgt = startTarget.clone().lerp(endTarget, e)
      controls.setLookAt(p.x, p.y, p.z, tgt.x, tgt.y, tgt.z, false)
      if (t < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  const seats = computeSeatLayouts(game.players.length)

  return (
    <>
      <color attach="background" args={['#18181e']} />
      <fog attach="fog" args={['#18181e', 15, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.8} decay={2} />
      <MarbleFloor />
      <TableMesh />
      {game.players.map((player, i) => (
        <PlayerSeat
          key={player.playerId}
          player={player}
          position={seats[i].position}
          rotation={seats[i].rotation}
          isActive={game.activePlayer === player.playerId}
          onCardClick={handleCardClick}
        />
      ))}
      <CameraControls ref={cameraRef} makeDefault maxPolarAngle={Math.PI / 2.2} minDistance={1} maxDistance={20} />
    </>
  )
}

const SpectatorScene = (props: SpectatorSceneProps) => (
  <Canvas camera={{ position: DEFAULT_CAMERA, fov: 50 }}>
    <Scene {...props} />
  </Canvas>
)

export default SpectatorScene
