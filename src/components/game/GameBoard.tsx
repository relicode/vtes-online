'use client'

import Badge from '@mui/material/Badge'
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
  const handleToggleLock = (minionInstanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleMinionLock', minionInstanceId })
  }

  return (
    <Stack spacing={2}>
      <GameActions
        gameId={gameId}
        playerId={playerId}
        phase={gameView.turn.phase}
        librarySize={gameView.self.library.length}
        cryptSize={gameView.self.crypt.length}
        pool={gameView.self.pool}
      />

      <div>
        <Typography variant="h6">Cards in Play</Typography>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
          {gameView.self.minions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No minions in play.
            </Typography>
          ) : (
            gameView.self.minions.map((m) => (
              <MinionCard key={m.instanceId} minion={m} onToggleLock={handleToggleLock} />
            ))
          )}
        </Stack>
      </div>

      {gameView.self.uncontrolled.length > 0 && (
        <div>
          <Typography variant="h6">Uncontrolled Region ({gameView.self.uncontrolled.length})</Typography>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
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
        </div>
      )}

      <Divider />

      <PlayerHand hand={gameView.self.hand} />
    </Stack>
  )
}

export default GameBoard
