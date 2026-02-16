'use client'

import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

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
  gfx?: string
}

const PublicGameContent = ({ gameId, initialState, gfx = '2d' }: PublicGameContentProps) => {
  const game = useGameEventStream({ gameId, initialState })
  const view3d = gfx === '3d'

  useEffect(() => {
    document.title = game.name
  }, [game.name])

  if (view3d) {
    return (
      <Box sx={{ height: '100%' }}>
        <SpectatorScene game={game} />
      </Box>
    )
  }

  // Global card data for cross-player targeting (sources shown in the target player's section)
  const allGlobalCards = game.players.flatMap((p) => [
    ...p.controlledCrypt.map((c) => ({ instanceId: c.instanceId, target: c.target, card: getCardById(c.cardId), playerId: p.playerId })),
    ...p.libraryCardsInPlay.map((c) => ({ instanceId: c.instanceId, target: c.target, card: getCardById(c.cardId), playerId: p.playerId })),
  ])
  const globalInstanceIds = new Set(allGlobalCards.map((c) => c.instanceId))

  const counterBadgeSlotProps = {
    badge: { style: { fontSize: 10, minWidth: 20, height: 20, borderRadius: '50%', padding: 0 } },
  } as const

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
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

            {(() => {
              // Unify all controlled in-play cards with resolved card data
              const allCards = [
                ...player.controlledCrypt.map((c) => ({
                  ...c,
                  card: getCardById(c.cardId),
                  kind: 'crypt' as const,
                })),
                ...player.libraryCardsInPlay.map((c) => ({
                  ...c,
                  card: getCardById(c.cardId),
                  kind: 'library' as const,
                })),
              ]

              const allInstanceIds = new Set(allCards.map((c) => c.instanceId))

              // Same-player sources: cards targeting another card in this player's area
              const sourceIds = new Set(
                allCards.filter((c) => c.target && allInstanceIds.has(c.target)).map((c) => c.instanceId),
              )

              // Cross-player sources: cards from other players targeting this player's cards
              const foreignSources = allGlobalCards.filter(
                (c) => c.playerId !== player.playerId && c.target && allInstanceIds.has(c.target),
              )

              // Build a flat source lookup: targetInstanceId → source cards (same-player + foreign)
              const allSourceCards = [
                ...allCards.filter((c) => sourceIds.has(c.instanceId)),
                ...foreignSources,
              ]
              const sourcesByTarget = new Map<string, typeof allSourceCards>()
              for (const src of allSourceCards) {
                const list = sourcesByTarget.get(src.target!)
                if (list) list.push(src)
                else sourcesByTarget.set(src.target!, [src])
              }

              // Anchors = this player's cards not acting as a same-player source
              const groups = allCards
                .filter((c) => !sourceIds.has(c.instanceId))
                .map((anchor) => ({
                  anchor,
                  sources: sourcesByTarget.get(anchor.instanceId) ?? [],
                }))

              const needsBadge = (c: (typeof allCards)[number]) =>
                c.kind === 'crypt' ||
                (c.card?.type === 'library' && c.card.types.some((t) => t === 'Ally' || t === 'Retainer'))

              return (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', flex: 1 }}>
                    {groups.map(({ anchor, sources }) => {
                      const hasCrossTarget =
                        anchor.target && !allInstanceIds.has(anchor.target) && globalInstanceIds.has(anchor.target)
                      const imgSx = {
                        width: '100%',
                        aspectRatio: '48/67',
                        borderRadius: 0.5,
                        display: 'block',
                        ...(hasCrossTarget && { border: '2px dashed', borderColor: 'error.main' }),
                      }

                      return (
                        <Box
                          key={anchor.instanceId}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: 60,
                            transform: anchor.locked ? 'rotate(25deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        >
                          {sources.map((src) => (
                            <Box key={src.instanceId} sx={{ height: 18, overflow: 'hidden', flexShrink: 0 }}>
                              <Box
                                component="img"
                                src={src.card?.url}
                                alt="Source card"
                                sx={{ width: '100%', aspectRatio: '48/67', borderRadius: 0.5, display: 'block' }}
                              />
                            </Box>
                          ))}
                          {needsBadge(anchor) ? (
                            <Badge
                              badgeContent={anchor.counters}
                              showZero
                              color="error"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              slotProps={counterBadgeSlotProps}
                            >
                              <Box
                                component="img"
                                src={anchor.card?.url}
                                alt={anchor.kind === 'crypt' ? 'Minion' : 'Ally'}
                                sx={imgSx}
                              />
                            </Badge>
                          ) : (
                            <Box component="img" src={anchor.card?.url} alt="Library card in play" sx={imgSx} />
                          )}
                        </Box>
                      )
                    })}
                  </Stack>
                  {player.uncontrolledCrypt.length > 0 && (
                    <Stack spacing={0.5}>
                      {player.uncontrolledCrypt.map((u) => (
                        <Badge
                          key={u.instanceId}
                          badgeContent={u.blood}
                          showZero
                          color="error"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          slotProps={counterBadgeSlotProps}
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
    </Stack>
  )
}

export default PublicGameContent
