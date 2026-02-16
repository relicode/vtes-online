'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useConfirm } from 'material-ui-confirm'
import { useState } from 'react'

import { performGameAction } from '$/actions/game-actions'
import { getCardById } from '$/data/cards'
import type { GameView } from '$/types/game'
import ActionBar from './ActionBar'
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
  const [selectedHand, setSelectedHand] = useState<Set<number>>(new Set())
  const [showImages, setShowImages] = useState(false)
  const [targetPickerFor, setTargetPickerFor] = useState<string | undefined>()
  const [longPressCard, setLongPressCard] = useState<string | undefined>()

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

  const handleLongPressLock = (instanceId: string) => {
    setLongPressCard(instanceId)
  }

  const longPressCardData = longPressCard
    ? [...gameView.self.controlledCrypt, ...gameView.self.libraryCardsInPlay].find(
        (c) => c.instanceId === longPressCard
      )
    : undefined
  const longPressCardName = longPressCardData ? (getCardById(longPressCardData.cardId)?.name ?? 'Unknown') : 'Unknown'

  const handlePickTarget = (targetInstanceId?: string) => {
    if (targetPickerFor) {
      performGameAction(gameId, playerId, { type: 'setCardTarget', instanceId: targetPickerFor, targetInstanceId })
    }
    setTargetPickerFor(undefined)
  }

  const buildTargetList = () => {
    type TargetEntry = { instanceId: string; cardName: string; playerName: string }
    const groups: { playerName: string; cards: TargetEntry[] }[] = []

    const addPlayer = (
      name: string,
      controlled: typeof gameView.self.controlledCrypt,
      library: typeof gameView.self.libraryCardsInPlay
    ) => {
      const cards: TargetEntry[] = []
      for (const c of controlled) {
        cards.push({ instanceId: c.instanceId, cardName: getCardById(c.cardId)?.name ?? 'Unknown', playerName: name })
      }
      for (const c of library) {
        cards.push({ instanceId: c.instanceId, cardName: getCardById(c.cardId)?.name ?? 'Unknown', playerName: name })
      }
      cards.sort((a, b) => a.cardName.localeCompare(b.cardName))
      if (cards.length > 0) groups.push({ playerName: name, cards })
    }

    addPlayer(gameView.self.name, gameView.self.controlledCrypt, gameView.self.libraryCardsInPlay)
    for (const opp of gameView.opponents) {
      addPlayer(opp.name, opp.controlledCrypt, opp.libraryCardsInPlay)
    }

    return groups
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

  const resolveTargetName = (targetInstanceId?: string) => {
    if (!targetInstanceId) return undefined
    const allCards = [
      ...gameView.self.controlledCrypt,
      ...gameView.self.libraryCardsInPlay,
      ...gameView.opponents.flatMap((o) => [...o.controlledCrypt, ...o.libraryCardsInPlay]),
    ]
    const target = allCards.find((c) => c.instanceId === targetInstanceId)
    return target ? (getCardById(target.cardId)?.name ?? 'Unknown') : undefined
  }

  const toggleHandCard = (index: number) => {
    setSelectedHand((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handlePlayFromHand = () => {
    performGameAction(gameId, playerId, { type: 'playFromHand', indices: [...selectedHand].sort() })
    setSelectedHand(new Set())
  }

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <GameActions
        gameId={gameId}
        playerId={playerId}
        phase={gameView.turn.phase}
        librarySize={gameView.self.library.length}
        cryptSize={gameView.self.crypt.length}
        pool={gameView.self.pool}
        showImages={showImages}
        selectedInPlayCount={selectedInPlay.size}
        onToggleImages={() => setShowImages((prev) => !prev)}
        onTrash={handleTrash}
      />

      <Stack spacing={4} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        <CardRow title="In play">
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
                  targetName={resolveTargetName(c.target)}
                  onSelect={toggleInPlay}
                  onToggleLock={handleToggleLock}
                  onLongPress={handleLongPressLock}
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
                  targetName={resolveTargetName(m.target)}
                  onSelect={toggleInPlay}
                  onToggleLock={handleToggleLock}
                  onLongPress={handleLongPressLock}
                  onAdjustBlood={handleAdjustMinionBlood}
                />
              ))}
            </>
          )}
        </CardRow>

        {gameView.self.uncontrolledCrypt.length > 0 && (
          <CardRow sx={{ border: '1px dashed', borderColor: 'warning.main', borderRadius: 1, p: 4, paddingTop: 2 }}>
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

        <PlayerHand
          hand={gameView.self.hand}
          showImages={showImages}
          selectedHand={selectedHand}
          onToggleHandCard={toggleHandCard}
        />
      </Stack>

      <ActionBar>
        <Button variant="contained" size="small" disabled={selectedHand.size === 0} onClick={handlePlayFromHand}>
          Play ({selectedHand.size})
        </Button>
      </ActionBar>

      <Dialog open={longPressCard !== undefined} onClose={() => setLongPressCard(undefined)} fullWidth maxWidth="xs">
        <DialogTitle>{longPressCardName}</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {['Directed Action', 'Bleed', 'Hunt'].map((action) => (
              <Button key={action} variant="outlined" fullWidth>
                {action}
              </Button>
            ))}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                const id = longPressCard
                setLongPressCard(undefined)
                setTargetPickerFor(id)
              }}
            >
              Target
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={targetPickerFor !== undefined}
        onClose={() => setTargetPickerFor(undefined)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Select Target</DialogTitle>
        <DialogContent>
          {(() => {
            const sourceCard = targetPickerFor
              ? [...gameView.self.controlledCrypt, ...gameView.self.libraryCardsInPlay].find(
                  (c) => c.instanceId === targetPickerFor
                )
              : undefined
            const hasTarget = sourceCard?.target !== undefined

            return (
              <List dense>
                {hasTarget && (
                  <ListItemButton onClick={() => handlePickTarget(undefined)}>
                    <ListItemText primary="Clear target" primaryTypographyProps={{ color: 'error' }} />
                  </ListItemButton>
                )}
                {buildTargetList().map((group) => (
                  <Box key={group.playerName}>
                    <ListSubheader disableSticky>{group.playerName}</ListSubheader>
                    {group.cards.map((card) => (
                      <ListItemButton
                        key={card.instanceId}
                        disabled={card.instanceId === targetPickerFor}
                        onClick={() => handlePickTarget(card.instanceId)}
                      >
                        <ListItemText primary={card.cardName} />
                      </ListItemButton>
                    ))}
                  </Box>
                ))}
              </List>
            )
          })()}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

export default PlayerPlayArea
