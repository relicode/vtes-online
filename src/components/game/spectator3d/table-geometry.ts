type SeatLayout = {
  position: [number, number, number]
  rotation: number
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
}

const computeSeatLayouts = (playerCount: number, tableRadius = 3, tableHeight = 0.1): SeatLayout[] => {
  const seats: SeatLayout[] = []
  const seatRadius = tableRadius + 0.8

  for (let i = 0; i < playerCount; i++) {
    const angle = (i / playerCount) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * seatRadius
    const z = Math.sin(angle) * seatRadius

    // Y-rotation so local -Z points from seat toward table center
    // local -Z in world = (-sin(θ), 0, -cos(θ)), direction to center = (-x/d, 0, -z/d)
    // → sin(θ) = x/d, cos(θ) = z/d → θ = atan2(x, z)
    const rotation = Math.atan2(x, z)

    // Camera behind the player, slightly above, looking at their card area
    const camBehind = seatRadius + 0.3
    const camX = Math.cos(angle) * camBehind
    const camZ = Math.sin(angle) * camBehind

    const targetDistance = seatRadius - 1.5
    const targetX = Math.cos(angle) * targetDistance
    const targetZ = Math.sin(angle) * targetDistance

    seats.push({
      position: [x, tableHeight, z],
      rotation,
      cameraPosition: [camX, 3.5, camZ],
      cameraTarget: [targetX, tableHeight, targetZ],
    })
  }

  return seats
}

export type { SeatLayout }
export { computeSeatLayouts }
