'use client'

import ViewInArIcon from '@mui/icons-material/ViewInAr'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { getCardById } from '$/data/cards'
import type { GameSummary } from '$/types/game'
import useGameEventStream from './GameEventStream'

const SpectatorScene = dynamic(() => import('./spectator3d/SpectatorScene'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  ),
})

type PublicGameContentProps = {
  gameId: string
  initialState: GameSummary
}

const PublicGameContent = ({ gameId, initialState }: PublicGameContentProps) => {
  const game = useGameEventStream({ gameId, initialState })
  const [view3d, setView3d] = useState(false)

  useEffect(() => {
    document.title = game.name
  }, [game.name])

  if (view3d) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={() => setView3d(false)} color="info">
            <ViewInArIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SpectatorScene game={game} />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} />
        <Chip label={`Round ${game.round} / Turn ${game.turnCount}`} variant="outlined" />
        <Chip label={`${game.playerCount} players`} variant="outlined" />
        <IconButton size="small" onClick={() => setView3d(true)} sx={{ ml: 'auto' }}>
          <ViewInArIcon />
        </IconButton>
      </Stack>

      <Stack spacing={1}>
        {game.players.map((player) => (
          <Paper key={player.playerId} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">{player.name}</Typography>
                <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32, fontSize: 14 }}>{player.pool}</Avatar>
                {game.activePlayer === player.playerId && <Chip label={game.phase} size="small" color="primary" />}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Chip label={`Hand: ${player.handSize}`} size="small" variant="outlined" />
                <Chip label={`Library: ${player.librarySize}`} size="small" variant="outlined" />
                <Chip label={`Crypt: ${player.cryptSize}`} size="small" variant="outlined" />
                <Chip label={`Ash: ${player.ashHeap.length}`} size="small" variant="outlined" />
              </Stack>
            </Stack>

            {(() => {
              const resolved = player.libraryCardsInPlay.map((c) => ({ ...c, card: getCardById(c.cardId) }))
              const nonAllyCards = resolved.filter((c) => c.card?.type === 'library' && !c.card.types.includes('Ally'))
              const allyCards = resolved.filter((c) => c.card?.type === 'library' && c.card.types.includes('Ally'))
              return (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Stack sx={{ flex: 1, gap: 0.5 }}>
                    {nonAllyCards.length > 0 && (
                      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        {nonAllyCards.map((c) => (
                          <Box
                            key={c.instanceId}
                            component="img"
                            src={c.card?.url}
                            alt="Library card in play"
                            sx={{
                              width: 60, aspectRatio: '48/67', borderRadius: 0.5, display: 'block',
                              transform: c.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                    {(player.minions.length > 0 || allyCards.length > 0) && (
                      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        {player.minions.map((m) => {
                          const minionCard = getCardById(m.cardId)
                          return (
                            <Badge
                              key={m.instanceId}
                              badgeContent={m.counters}
                              showZero
                              color="error"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              sx={{
                                width: 60,
                                transform: m.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s',
                              }}
                              slotProps={{
                                badge: {
                                  style: { fontSize: 10, minWidth: 20, height: 20, borderRadius: '50%', padding: 0 },
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src={minionCard?.url}
                                alt="Minion"
                                sx={{ width: '100%', aspectRatio: '48/67', borderRadius: 0.5, display: 'block' }}
                              />
                            </Badge>
                          )
                        })}
                        {allyCards.map((c) => (
                          <Badge
                            key={c.instanceId}
                            badgeContent={c.counters}
                            showZero
                            color="error"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            sx={{
                              width: 60,
                              transform: c.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s',
                            }}
                            slotProps={{
                              badge: {
                                style: { fontSize: 10, minWidth: 20, height: 20, borderRadius: '50%', padding: 0 },
                              },
                            }}
                          >
                            <Box
                              component="img"
                              src={c.card?.url}
                              alt="Ally"
                              sx={{ width: '100%', aspectRatio: '48/67', borderRadius: 0.5, display: 'block' }}
                            />
                          </Badge>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                  {player.uncontrolled.length > 0 && (
                    <Stack spacing={0.5}>
                      {player.uncontrolled.map((u) => (
                        <Badge
                          key={u.instanceId}
                          badgeContent={u.blood}
                          showZero
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
                </Stack>
              )
            })()}
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default PublicGameContent
