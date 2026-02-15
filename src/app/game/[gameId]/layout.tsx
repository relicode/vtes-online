import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import type { ReactNode } from 'react'

type GameLayoutProps = {
  public: ReactNode
  player: ReactNode
}

const GameLayout = ({ public: publicSlot, player }: GameLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{publicSlot}</Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: '1 1 0', minWidth: 0, overflow: 'auto' }}>{player}</Box>
    </Box>
  )
}

export default GameLayout
