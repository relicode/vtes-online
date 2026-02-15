'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useParams } from 'next/navigation'
import type { ReactNode } from 'react'

type GameLayoutShellProps = {
  public: ReactNode
  player: ReactNode
  log: ReactNode
}

const GameLayoutShell = ({ public: publicSlot, player, log }: GameLayoutShellProps) => {
  const params = useParams<{ userId?: string }>()
  const isPlayerView = params.userId !== undefined

  if (isPlayerView) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{publicSlot}</Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{player}</Box>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: '30vh', overflow: 'auto' }}>{log}</Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{publicSlot}</Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{log}</Box>
    </Box>
  )
}

export default GameLayoutShell
