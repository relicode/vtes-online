'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { GamePublicState, PlayerPrivateState } from '$/types/game'

import PlayerHand from './PlayerHand'
import VampireCard from './VampireCard'

type GameBoardProps = {
  game: GamePublicState
  playerState: PlayerPrivateState
}

const GameBoard = ({ game, playerState }: GameBoardProps) => {
  const isMyTurn = game.currentTurn === playerState.userId

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Chip label={`Turn ${game.turnNumber}`} color="primary" />
        <Chip label={isMyTurn ? 'Your Turn' : 'Waiting...'} color={isMyTurn ? 'success' : 'default'} />
        <Chip label={`Pool: ${playerState.pool}`} variant="outlined" />
        <Chip label={`Library: ${playerState.librarySize}`} variant="outlined" />
        <Chip label={`Crypt: ${playerState.cryptSize}`} variant="outlined" />
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Vampires in Play
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
        {playerState.vampiresInPlay.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No vampires in play.
          </Typography>
        ) : (
          playerState.vampiresInPlay.map((v) => <VampireCard key={v.cardId} vampire={v} />)
        )}
      </Stack>

      {playerState.uncontrolledRegion.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Uncontrolled Region ({playerState.uncontrolledRegion.length})
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {playerState.uncontrolledRegion.map((cardId, i) => (
              <Chip key={`${cardId}-${i}`} label={cardId} variant="outlined" />
            ))}
          </Stack>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <PlayerHand hand={playerState.hand} />

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Other Players
      </Typography>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {game.players
          .filter((p) => p.userId !== playerState.userId)
          .map((p) => (
            <Paper key={p.userId} variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2">{p.name}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                <Chip label={`Pool: ${p.poolSize}`} size="small" variant="outlined" />
                <Chip label={`Vampires: ${p.vampiresInPlay}`} size="small" variant="outlined" />
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Box>
  )
}

export default GameBoard
