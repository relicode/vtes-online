'use client'

import { useState } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

const TABLE_RADIUS = 3
const TABLE_HEIGHT = 0.1

const createWoodTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Dark oak base
  ctx.fillStyle = '#2a1810'
  ctx.fillRect(0, 0, 512, 512)

  // Wood grain lines
  for (let y = 0; y < 512; y++) {
    const wave = Math.sin(y * 0.04) * 8 + Math.sin(y * 0.11) * 3
    const brightness = 20 + Math.sin(y * 0.08 + wave * 0.1) * 12 + Math.random() * 6
    const r = Math.floor(42 + brightness * 0.8)
    const g = Math.floor(24 + brightness * 0.5)
    const b = Math.floor(16 + brightness * 0.3)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, y, 512, 1)
  }

  // Darker knot-like rings
  for (let i = 0; i < 3; i++) {
    const kx = 100 + Math.random() * 312
    const ky = 100 + Math.random() * 312
    const kr = 20 + Math.random() * 30
    ctx.strokeStyle = 'rgba(18, 10, 6, 0.4)'
    ctx.lineWidth = 2
    for (let r = kr; r > 4; r -= 4) {
      ctx.beginPath()
      ctx.ellipse(kx, ky, r, r * 0.6, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  return texture
}

const TableMesh = () => {
  const [texture] = useState(createWoodTexture)

  return (
    <group>
      {/* Dark oak table body */}
      <mesh position={[0, TABLE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[TABLE_RADIUS, TABLE_RADIUS, TABLE_HEIGHT, 64]} />
        <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Raised oak edge */}
      <mesh position={[0, TABLE_HEIGHT + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[TABLE_RADIUS, 0.06, 16, 64]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} color="#1e1008" />
      </mesh>
    </group>
  )
}

export default TableMesh
export { TABLE_RADIUS }
