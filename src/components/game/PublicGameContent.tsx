'use client'

import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'

import { getCardById } from '$/data/cards'
import type { GameSummary } from '$/types/game'
import useGameEventStream from './GameEventStream'

type PublicGameContentProps = {
  gameId: string
  initialState: GameSummary
}

const PublicGameContent = ({ gameId, initialState }: PublicGameContentProps) => {
  const game = useGameEventStream({ gameId, initialState })

  useEffect(() => {
    document.title = game.name
  }, [game.name])

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={1}>
        <Chip label={game.status} color={game.status === 'active' ? 'success' : 'default'} />
        <Chip label={`Round ${game.round} / Turn ${game.turnCount}`} variant="outlined" />
        <Chip label={`${game.playerCount} players`} variant="outlined" />
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

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Stack sx={{ flex: 1, gap: 0.5 }}>
                {player.libraryCardsInPlay.some((c) => {
                  const card = getCardById(c.cardId)
                  return card?.type === 'library' && !card.types.includes('Ally')
                }) && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {player.libraryCardsInPlay
                      .filter((c) => {
                        const card = getCardById(c.cardId)
                        return card?.type === 'library' && !card.types.includes('Ally')
                      })
                      .map((c) => (
                        <Box
                          key={c.instanceId}
                          component="img"
                          src={getCardById(c.cardId)?.url}
                          alt="Library card in play"
                          sx={{
                            flex: 1, minWidth: 48, maxWidth: 80, aspectRatio: '48/67', borderRadius: 0.5, display: 'block',
                            transform: c.locked ? 'rotate(25deg)' : 'none', transition: 'transform 0.2s',
                          }}
                        />
                      ))}
                  </Box>
                )}
                {(player.minions.length > 0 ||
                  player.libraryCardsInPlay.some((c) => {
                    const card = getCardById(c.cardId)
                    return card?.type === 'library' && card.types.includes('Ally')
                  })) && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {player.minions.map((m) => (
                      <Badge
                        key={m.instanceId}
                        badgeContent={m.counters}
                        showZero
                        color="error"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{
                          flex: 1, minWidth: 48, maxWidth: 80,
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
                          src={getCardById(m.cardId)?.url}
                          alt="Minion"
                          sx={{ width: '100%', aspectRatio: '48/67', borderRadius: 0.5, display: 'block' }}
                        />
                      </Badge>
                    ))}
                    {player.libraryCardsInPlay
                      .filter((c) => {
                        const card = getCardById(c.cardId)
                        return card?.type === 'library' && card.types.includes('Ally')
                      })
                      .map((c) => (
                        <Badge
                          key={c.instanceId}
                          badgeContent={c.counters}
                          showZero
                          color="error"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          sx={{
                            flex: 1, minWidth: 48, maxWidth: 80,
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
                            src={getCardById(c.cardId)?.url}
                            alt="Ally"
                            sx={{ width: '100%', aspectRatio: '48/67', borderRadius: 0.5, display: 'block' }}
                          />
                        </Badge>
                      ))}
                  </Box>
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
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export default PublicGameContent
