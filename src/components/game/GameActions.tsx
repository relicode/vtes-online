'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { performGameAction } from '$/actions/game-actions'
import type { TurnPhase } from '$/types/game'

type GameActionsProps = {
  gameId: string
  playerId: string
  phase: TurnPhase
}

const phaseLabels: Record<TurnPhase, string> = {
  unlock: 'Unlock',
  master: 'Master',
  minion: 'Minion',
  influence: 'Influence',
  discard: 'Discard',
}

const GameActions = ({ gameId, playerId, phase }: GameActionsProps) => {
  const act = (action: Parameters<typeof performGameAction>[2]) => performGameAction(gameId, playerId, action)

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button variant="outlined" size="small" onClick={() => act({ type: 'drawFromLibrary' })}>
        Draw Library
      </Button>
      <Button variant="outlined" size="small" onClick={() => act({ type: 'drawFromCrypt' })}>
        Draw Crypt
      </Button>
      <Button variant="outlined" size="small" onClick={() => act({ type: 'adjustPool', delta: -1 })}>
        Pool -1
      </Button>
      <Button variant="outlined" size="small" onClick={() => act({ type: 'adjustPool', delta: 1 })}>
        Pool +1
      </Button>
      <Button variant="contained" size="small" onClick={() => act({ type: 'advancePhase' })}>
        Next Phase ({phaseLabels[phase]})
      </Button>
    </Stack>
  )
}

export default GameActions
