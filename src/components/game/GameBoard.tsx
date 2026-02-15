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
  const activePlayerName = gameView.opponents.find((o) => o.playerId === gameView.turn.activePlayer)?.name

  const handleToggleLock = (minionInstanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleMinionLock', minionInstanceId })
  }

  return (
    <Box>
      <GameActions
        gameId={gameId}
        playerId={playerId}
        phase={gameView.turn.phase}
        librarySize={gameView.self.library.length}
        cryptSize={gameView.self.crypt.length}
        pool={gameView.self.pool}
      />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
        <Chip label={`Round ${gameView.round} / Turn ${gameView.turnCount}`} color="primary" />
        <Chip
          label={isMyTurn ? 'Your Turn' : `Waiting for ${activePlayerName}`}
          color={isMyTurn ? 'success' : 'default'}
        />
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Cards in Play
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
    </Box>
  )
}

export default GameBoard
