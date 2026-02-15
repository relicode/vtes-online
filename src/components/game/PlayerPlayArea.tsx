'use client'

import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useConfirm } from 'material-ui-confirm'
import { useState } from 'react'

import { performGameAction } from '$/actions/game-actions'
import { getCardById } from '$/data/cards'
import type { GameView } from '$/types/game'
import CardRow from './CardRow'
import CryptCard from './CryptCard'
import GameActions from './GameActions'
import LibraryCardInPlayComponent from './LibraryCardInPlay'
import PlayerHand from './PlayerHand'

type PlayerPlayAreaProps = {
  gameView: GameView
  gameId: string
  playerId: string
}

const PlayerPlayArea = ({ gameView, gameId, playerId }: PlayerPlayAreaProps) => {
  const confirm = useConfirm()
  const [selectedInPlay, setSelectedInPlay] = useState<Set<string>>(new Set())
  const [showImages, setShowImages] = useState(false)

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
      const minion = gameView.self.controlledCrypt.find((m) => m.instanceId === id)
      if (minion) {
        names.push(getCardById(minion.cardId)?.name ?? 'Unknown')
        continue
      }
      const lib = gameView.self.libraryCardsInPlay.find((c) => c.instanceId === id)
      if (lib) {
        names.push(getCardById(lib.cardId)?.name ?? 'Unknown')
        continue
      }
      const unc = gameView.self.uncontrolledCrypt.find((u) => u.instanceId === id)
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

  const handleToggleLock = (instanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleLock', instanceId })
  }

  const handleAdjustMinionBlood = (minionInstanceId: string, delta: number) => {
    performGameAction(gameId, playerId, { type: 'adjustMinionCounters', minionInstanceId, delta })
  }

  const handleAdjustUncontrolledBlood = (minionInstanceId: string, delta: number) => {
    performGameAction(gameId, playerId, { type: 'adjustUncontrolledBlood', minionInstanceId, delta })
  }

  const handleAdjustLibraryCardLife = (instanceId: string, delta: number) => {
    performGameAction(gameId, playerId, { type: 'adjustLibraryCardCounters', instanceId, delta })
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
        showImages={showImages}
        onToggleImages={() => setShowImages((prev) => !prev)}
      />

      <CardRow
        title="Cards in Play"
        actions={
          <IconButton size="small" disabled={selectedInPlay.size === 0} onClick={handleTrash} color="error">
            <DeleteIcon />
          </IconButton>
        }
      >
        {gameView.self.libraryCardsInPlay.length === 0 && gameView.self.controlledCrypt.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No cards in play.
          </Typography>
        ) : (
          <>
            {gameView.self.libraryCardsInPlay.map((c) => (
              <LibraryCardInPlayComponent
                key={c.instanceId}
                libraryCard={c}
                selected={selectedInPlay.has(c.instanceId)}
                showImages={showImages}
                onSelect={toggleInPlay}
                onToggleLock={handleToggleLock}
                onAdjustLife={handleAdjustLibraryCardLife}
              />
            ))}
            {gameView.self.libraryCardsInPlay.length > 0 && gameView.self.controlledCrypt.length > 0 && (
              <Box sx={{ width: '100%' }} />
            )}
            {gameView.self.controlledCrypt.map((m) => (
              <CryptCard
                key={m.instanceId}
                controlled
                cryptCard={m}
                selected={selectedInPlay.has(m.instanceId)}
                showImages={showImages}
                onSelect={toggleInPlay}
                onToggleLock={handleToggleLock}
                onAdjustBlood={handleAdjustMinionBlood}
              />
            ))}
          </>
        )}
      </CardRow>

      {gameView.self.uncontrolledCrypt.length > 0 && (
        <CardRow title="Uncontrolled">
          {gameView.self.uncontrolledCrypt.map((u) => (
            <CryptCard
              key={u.instanceId}
              controlled={false}
              cryptCard={u}
              selected={selectedInPlay.has(u.instanceId)}
              showImages={showImages}
              onSelect={toggleInPlay}
              onAdjustBlood={handleAdjustUncontrolledBlood}
            />
          ))}
        </CardRow>
      )}

      <Divider />

      <PlayerHand hand={gameView.self.hand} showImages={showImages} onPlay={handlePlayFromHand} />
    </Stack>
  )
}

export default PlayerPlayArea
