'use client'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import RemoveIcon from '@mui/icons-material/Remove'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useConfirm } from 'material-ui-confirm'

import { performGameAction } from '$/actions/game-actions'
import CardTypeIcon from '$/components/CardTypeIcon'
import ClanIcon from '$/components/ClanIcon'
import { getCardById } from '$/data/cards'
import type { GameView } from '$/types/game'
import CardRow from './CardRow'
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
  const [showImages, setShowImages] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

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

  const toggleExpanded = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
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

  const handleToggleLock = (instanceId: string) => {
    performGameAction(gameId, playerId, { type: 'toggleLock', instanceId })
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
                <Box key={c.instanceId}>
                  <Badge
                    badgeContent={
                      <IconButton
                        size="small"
                        onClick={() => handleToggleLock(c.instanceId)}
                        sx={{ p: 0.25, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' }, borderRadius: '50%' }}
                      >
                        {c.locked ? (
                          <LockIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                        ) : (
                          <LockOpenIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        )}
                      </IconButton>
                    }
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                      badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 } },
                    }}
                  >
                    <Tooltip
                      enterDelay={2000}
                      enterNextDelay={2000}
                      placement="left"
                      title={card ? <Box component="img" src={card.url} alt={card.name} sx={{ width: 250 }} /> : ''}
                      slotProps={{ tooltip: { sx: { bgcolor: 'transparent', p: 0 } } }}
                    >
                      {showImages ? (
                        <Box
                          component="img"
                          src={card?.url}
                          alt={card?.name ?? 'Unknown'}
                          onClick={() => toggleInPlay(c.instanceId)}
                          sx={{
                            width: 120,
                            aspectRatio: '48/67',
                            borderRadius: 0.5,
                            display: 'block',
                            cursor: 'pointer',
                            outline: isSelected ? '3px solid' : 'none',
                            outlineColor: 'primary.main',
                          }}
                        />
                      ) : (
                        <Badge
                          badgeContent={
                            card?.cardText ? (
                              <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); toggleExpanded(c.instanceId) }}
                                sx={{ p: 0.25, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' }, borderRadius: '50%' }}
                              >
                                <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary', transform: expandedCards.has(c.instanceId) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                              </IconButton>
                            ) : undefined
                          }
                          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                          slotProps={{
                            badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 } },
                          }}
                        >
                          <Paper
                            variant="outlined"
                            onClick={() => toggleInPlay(c.instanceId)}
                            sx={{
                              p: 1.5,
                              maxWidth: 200,
                              cursor: 'pointer',
                              borderColor: isSelected ? 'primary.main' : 'success.main',
                              borderWidth: 2,
                              bgcolor: isSelected ? 'action.selected' : undefined,
                            }}
                          >
                            <Typography variant="subtitle2">{card?.name ?? 'Unknown'}</Typography>
                            {card?.type === 'library' && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                {card.types.map((t) => (
                                  <CardTypeIcon key={t} type={t} size={32} />
                                ))}
                                {card.clans?.map((clan) => (
                                  <ClanIcon key={clan} clan={clan} size={32} />
                                ))}
                                {card.bloodCost !== undefined && (
                                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                    {card.bloodCost} blood
                                  </Typography>
                                )}
                                {card.poolCost !== undefined && (
                                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                    {card.poolCost} pool
                                  </Typography>
                                )}
                              </Stack>
                            )}
                            {card?.cardText && (
                              <Collapse in={expandedCards.has(c.instanceId)}>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', whiteSpace: 'pre-line' }}>
                                  {card.cardText}
                                </Typography>
                              </Collapse>
                            )}
                          </Paper>
                        </Badge>
                      )}
                    </Tooltip>
                  </Badge>
                </Box>
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
                showImages={showImages}
                onSelect={toggleInPlay}
                onToggleLock={handleToggleLock}
                onAdjustBlood={handleAdjustMinionBlood}
              />
            ))}
          </>
        )}
      </CardRow>

      {gameView.self.uncontrolled.length > 0 && (
        <CardRow title="Uncontrolled">
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
                  <Tooltip
                    enterDelay={2000}
                    enterNextDelay={2000}
                    placement="left"
                    title={card ? <Box component="img" src={card.url} alt={card.name} sx={{ width: 250 }} /> : ''}
                    slotProps={{ tooltip: { sx: { bgcolor: 'transparent', p: 0 } } }}
                  >
                    {showImages ? (
                      <Box
                        component="img"
                        src={card?.url}
                        alt={card?.name ?? 'Unknown'}
                        onClick={() => toggleInPlay(u.instanceId)}
                        sx={{
                          width: 120,
                          aspectRatio: '48/67',
                          borderRadius: 0.5,
                          display: 'block',
                          cursor: 'pointer',
                          outline: isSelected ? '3px solid' : 'none',
                          outlineColor: 'primary.main',
                        }}
                      />
                    ) : (
                      <Badge
                        badgeContent={
                          card?.cardText ? (
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); toggleExpanded(u.instanceId) }}
                              sx={{ p: 0.25, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' }, borderRadius: '50%' }}
                            >
                              <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary', transform: expandedCards.has(u.instanceId) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </IconButton>
                          ) : undefined
                        }
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                        slotProps={{
                          badge: { style: { backgroundColor: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 } },
                        }}
                      >
                        <Paper
                          variant="outlined"
                          onClick={() => toggleInPlay(u.instanceId)}
                          sx={{
                            p: 1.5,
                            maxWidth: 200,
                            cursor: 'pointer',
                            borderColor: isSelected ? 'primary.main' : 'warning.main',
                            borderWidth: 2,
                            bgcolor: isSelected ? 'action.selected' : undefined,
                          }}
                        >
                          <Typography variant="subtitle2">{card?.name ?? 'Unknown'}</Typography>
                          {card?.type === 'crypt' && (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                              {card.clans.map((clan) => (
                                <ClanIcon key={clan} clan={clan} size={32} />
                              ))}
                              {card.title && (
                                <Typography variant="caption" color="text.secondary">{card.title}</Typography>
                              )}
                              {card.adv && (
                                <Chip label="ADV" size="small" color="info" sx={{ height: 18, fontSize: 10 }} />
                              )}
                            </Stack>
                          )}
                          {card?.cardText && (
                            <Collapse in={expandedCards.has(u.instanceId)}>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', whiteSpace: 'pre-line' }}>
                                {card.cardText}
                              </Typography>
                            </Collapse>
                          )}
                        </Paper>
                      </Badge>
                    )}
                  </Tooltip>
                </Badge>
              )
            })}
        </CardRow>
      )}

      <Divider />

      <PlayerHand hand={gameView.self.hand} showImages={showImages} onPlay={handlePlayFromHand} />
    </Stack>
  )
}

export default GameBoard
