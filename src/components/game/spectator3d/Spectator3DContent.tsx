'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import useGameEventStream from '$/components/game/GameEventStream'
import type { GameSummary } from '$/types/game'

import SpectatorSidebar from './SpectatorSidebar'

const SpectatorScene = dynamic(() => import('./SpectatorScene'), { ssr: false })

type Spectator3DContentProps = {
  gameId: string
  initialState: GameSummary
}

const Spectator3DContent = ({ gameId, initialState }: Spectator3DContentProps) => {
  const game = useGameEventStream({ gameId, initialState })
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | undefined>(undefined)

  useEffect(() => {
    document.title = game.name
  }, [game.name])

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      <Box sx={{ flex: '2 1 0', minWidth: 0 }}>
        <SpectatorScene game={game} focusedPlayerId={focusedPlayerId} />
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: '1 1 0', maxWidth: 360, minWidth: 240, overflow: 'hidden' }}>
        <SpectatorSidebar game={game} focusedPlayerId={focusedPlayerId} onFocusPlayer={setFocusedPlayerId} />
      </Box>
    </Box>
  )
}

export default Spectator3DContent
