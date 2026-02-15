'use client'

import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { performGameAction } from '$/actions/game-actions'
import { getCardById } from '$/data/cards'
import type { GameView } from '$/types/game'
import ActionLog from './ActionLog'
import GameActions from './GameActions'
import MinionCard from './MinionCard'
import PlayerHand from './PlayerHand'

type GameBoardProps = {
  gameView: GameView
  gameId: string
  playerId: string
}

const GameBoard = ({ gameView, gameId, playerId }: GameBoardProps) => {
  const isMyTurn = gameView.turn.activePlayer === gameView.self.playerId

  const handleToggleLock = (minionInstanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleMinionLock', minionInstanceId })
  }

  return (
    <Box>
      <GameActions gameId={gameId} playerId={playerId} phase={gameView.turn.phase} />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
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
          gameView.self.minions.map((m) => <MinionCard key={m.instanceId} minion={m} onToggleLock={handleToggleLock} />)
        )}
      </Stack>

      {gameView.self.uncontrolled.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Uncontrolled Region ({gameView.self.uncontrolled.length})
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            {gameView.self.uncontrolled.map((u) => {
              const card = getCardById(u.cardId)
              const capacity = card?.type === 'crypt' ? card.capacity : 0
              return (
                <Badge
                  key={u.instanceId}
                  badgeContent={`${u.blood}/${capacity}`}
                  color="error"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  slotProps={{
                    badge: {
                      style: { fontSize: 10, minWidth: 24, height: 24, borderRadius: '50%', padding: 0 },
                    },
                  }}
                >
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{card?.name ?? 'Unknown'}</Typography>
                  </Paper>
                </Badge>
              )
            })}
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
            {opp.uncontrolled.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                {opp.uncontrolled.map((u) => (
                  <Badge
                    key={u.instanceId}
                    badgeContent={u.blood}
                    color="error"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    slotProps={{
                      badge: {
                        style: { fontSize: 10, minWidth: 20, height: 20, borderRadius: '50%', padding: 0 },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/cards/cardbackcrypt.jpg"
                      alt="Uncontrolled"
                      sx={{ width: 48, height: 67, borderRadius: 0.5, display: 'block' }}
                    />
                  </Badge>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <ActionLog entries={gameView.actionLog} />
    </Box>
  )
}

export default GameBoard
