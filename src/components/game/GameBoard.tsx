'use client'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useConfirm } from 'material-ui-confirm'

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
  const confirm = useConfirm()
  const [selectedInPlay, setSelectedInPlay] = useState<Set<string>>(new Set())

  const toggleInPlay = (instanceId: string) => {
    setSelectedInPlay((prev) => {
      const next = new Set(prev)
      if (next.has(instanceId)) {
        next.delete(instanceId)
      } else {
        next.add(instanceId)
      }
      return next
    })
  }

  const getSelectedCardNames = () => {
    const names: string[] = []
    for (const id of selectedInPlay) {
      const minion = gameView.self.minions.find((m) => m.instanceId === id)
      if (minion) {
        names.push(getCardById(minion.cardId)?.name ?? 'Unknown')
        continue
      }
      const lib = gameView.self.libraryCardsInPlay.find((c) => c.instanceId === id)
      if (lib) {
        names.push(getCardById(lib.cardId)?.name ?? 'Unknown')
        continue
      }
      const unc = gameView.self.uncontrolled.find((u) => u.instanceId === id)
      if (unc) {
        names.push(getCardById(unc.cardId)?.name ?? 'Unknown')
      }
    }
    return names
  }

  const handleTrash = async () => {
    const names = getSelectedCardNames()
    const { confirmed } = await confirm({
      title: 'Move to ash heap',
      description: `Move ${names.join(', ')} to ash heap?`,
      confirmationText: 'Move to ash',
      confirmationButtonProps: { color: 'error', variant: 'contained' },
    })
    if (confirmed) {
      performGameAction(gameId, playerId, { type: 'trashFromPlay', instanceIds: [...selectedInPlay] })
      setSelectedInPlay(new Set())
    }
  }

  const handleToggleLock = (minionInstanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleMinionLock', minionInstanceId })
  }

  const handleAdjustMinionBlood = (minionInstanceId: string, delta: number) => {
    performGameAction(gameId, playerId, { type: 'adjustMinionCounters', minionInstanceId, delta })
  }

  const handleAdjustUncontrolledBlood = (minionInstanceId: string, delta: number) => {
    performGameAction(gameId, playerId, { type: 'adjustUncontrolledBlood', minionInstanceId, delta })
  }

  const handlePlayFromHand = (indices: number[]) => {
    performGameAction(gameId, playerId, { type: 'playFromHand', indices })
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

      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <Typography variant="h5" textAlign="center">Cards in Play</Typography>
        <IconButton size="small" disabled={selectedInPlay.size === 0} onClick={handleTrash} color="error">
          <DeleteIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {gameView.self.libraryCardsInPlay.length === 0 && gameView.self.minions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No cards in play.
          </Typography>
        ) : (
          <>
            {gameView.self.libraryCardsInPlay.map((c) => {
              const card = getCardById(c.cardId)
              const isSelected = selectedInPlay.has(c.instanceId)
              return (
                <Paper
                  key={c.instanceId}
                  variant="outlined"
                  onClick={() => toggleInPlay(c.instanceId)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderColor: isSelected ? 'primary.main' : 'success.main',
                    borderWidth: isSelected ? 2 : 1,
                    bgcolor: isSelected ? 'action.selected' : undefined,
                  }}
                >
                  <Typography variant="subtitle2">{card?.name ?? 'Unknown'}</Typography>
                </Paper>
              )
            })}
            {gameView.self.libraryCardsInPlay.length > 0 && gameView.self.minions.length > 0 && (
              <Box sx={{ width: '100%' }} />
            )}
            {gameView.self.minions.map((m) => (
              <MinionCard
                key={m.instanceId}
                minion={m}
                selected={selectedInPlay.has(m.instanceId)}
                onSelect={toggleInPlay}
                onToggleLock={handleToggleLock}
                onAdjustBlood={handleAdjustMinionBlood}
              />
            ))}
          </>
        )}
      </Stack>

      {gameView.self.uncontrolled.length > 0 && (
        <div>
          <Typography variant="h6">Uncontrolled</Typography>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
            {gameView.self.uncontrolled.map((u) => {
              const card = getCardById(u.cardId)
              const capacity = card?.type === 'crypt' ? card.capacity : 0
              const isSelected = selectedInPlay.has(u.instanceId)
              return (
                <Badge
                  key={u.instanceId}
                  badgeContent={
                    <Stack direction="row" spacing={0} alignItems="center" sx={{ bgcolor: 'error.main', borderRadius: 3, px: 0.25 }}>
                      <IconButton size="small" disabled={u.blood <= 0} onClick={() => handleAdjustUncontrolledBlood(u.instanceId, -1)} sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: 'error.contrastText', fontWeight: 'bold', mx: 0.25 }}>{`${u.blood}/${capacity}`}</Typography>
                      <IconButton size="small" disabled={u.blood >= capacity} onClick={() => handleAdjustUncontrolledBlood(u.instanceId, 1)} sx={{ p: 0, color: 'error.contrastText', '&.Mui-disabled': { color: 'error.dark' } }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  }
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  slotProps={{
                    badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0, left: '50%', transform: 'translate(-50%, 50%)' } },
                  }}
                >
                  <Paper
                    variant="outlined"
                    onClick={() => toggleInPlay(u.instanceId)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderColor: isSelected ? 'primary.main' : 'warning.main',
                      borderWidth: isSelected ? 2 : 1,
                      bgcolor: isSelected ? 'action.selected' : undefined,
                    }}
                  >
                    <Typography variant="subtitle2">{card?.name ?? 'Unknown'}</Typography>
                  </Paper>
                </Badge>
              )
            })}
          </Stack>
        </div>
      )}

      <Divider />

      <PlayerHand hand={gameView.self.hand} onPlay={handlePlayFromHand} />
    </Stack>
  )
}

export default GameBoard
