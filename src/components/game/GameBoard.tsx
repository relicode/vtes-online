'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { GameView } from '$/types/game'
import MinionCard from './MinionCard'
import PlayerHand from './PlayerHand'

type GameBoardProps = {
  gameView: GameView
}

const GameBoard = ({ gameView }: GameBoardProps) => {
  const isMyTurn = gameView.turn.activePlayer === gameView.self.playerId

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Chip label={`Round ${gameView.round} / Turn ${gameView.turnCount}`} color="primary" />
        <Chip label={isMyTurn ? 'Your Turn' : 'Waiting...'} color={isMyTurn ? 'success' : 'default'} />
        <Chip label={`Pool: ${gameView.self.pool}`} variant="outlined" />
        <Chip label={`Library: ${gameView.self.library.length}`} variant="outlined" />
        <Chip label={`Crypt: ${gameView.self.crypt.length}`} variant="outlined" />
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Minions in Play
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
        {gameView.self.minions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No minions in play.
          </Typography>
        ) : (
          gameView.self.minions.map((m) => <MinionCard key={m.instanceId} minion={m} />)
        )}
      </Stack>

      {gameView.self.uncontrolled.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Uncontrolled Region ({gameView.self.uncontrolled.length})
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {gameView.self.uncontrolled.map((u) => (
              <Chip key={u.instanceId} label={`Blood: ${u.blood}`} variant="outlined" />
            ))}
          </Stack>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <PlayerHand hand={gameView.self.hand} />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Other Players
      </Typography>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {gameView.opponents.map((opp) => (
          <Paper key={opp.playerId} variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="subtitle2">{opp.name}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              <Chip label={`Pool: ${opp.pool}`} size="small" variant="outlined" />
              <Chip label={`Minions: ${opp.minions.length}`} size="small" variant="outlined" />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default GameBoard
