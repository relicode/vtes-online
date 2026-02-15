'use client'

import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useConfirm } from 'material-ui-confirm'

import { performGameAction } from '$/actions/game-actions'
import type { TurnPhase } from '$/types/game'

type GameActionsProps = {
  gameId: string
  playerId: string
  phase: TurnPhase
  librarySize: number
  cryptSize: number
  pool: number
  showImages: boolean
  selectedInPlayCount: number
  onToggleImages: () => void
  onTrash: () => void
}

const phases: TurnPhase[] = ['unlock', 'master', 'minion', 'influence', 'discard']

const phaseLabels: Record<TurnPhase, string> = {
  unlock: 'Unlock',
  master: 'Master',
  minion: 'Minion',
  influence: 'Influence',
  discard: 'Discard',
}

const nextPhaseLabel = (current: TurnPhase) => {
  const idx = phases.indexOf(current)
  return phaseLabels[phases[idx + 1]] ?? 'End Turn'
}

const GameActions = ({
  gameId,
  playerId,
  phase,
  librarySize,
  cryptSize,
  pool,
  showImages,
  selectedInPlayCount,
  onToggleImages,
  onTrash,
}: GameActionsProps) => {
  const confirm = useConfirm()
  const act = (action: Parameters<typeof performGameAction>[2]) => performGameAction(gameId, playerId, action)

  const handleEndTurn = async () => {
    const { confirmed } = await confirm({
      title: 'End turn',
      description: 'Are you sure you want to end your turn?',
      confirmationText: 'End turn',
      confirmationButtonProps: { color: 'warning', variant: 'contained' },
    })
    if (confirmed) {
      act({ type: 'advancePhase' })
    }
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'primary.light',
        px: 1.5,
        py: 0.25,
      }}
    >
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Tooltip title={showImages ? 'Show text cards' : 'Show card images'}>
          <IconButton
            size="small"
            onClick={onToggleImages}
            color={showImages ? 'info' : 'default'}
            sx={{ width: 28, height: 28, p: 0 }}
          >
            <ImageIcon />
          </IconButton>
        </Tooltip>
        <Stack direction="row" alignItems="center" sx={{ gap: 0 }}>
          <IconButton
            size="small"
            color="error"
            disabled={pool === 0}
            onClick={() => act({ type: 'adjustPool', delta: -1 })}
            sx={{ width: 28, height: 28, p: 0 }}
          >
            -
          </IconButton>
          <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32, fontSize: 14 }}>{pool}</Avatar>
          <IconButton
            size="small"
            color="error"
            onClick={() => act({ type: 'adjustPool', delta: 1 })}
            sx={{ width: 28, height: 28, p: 0 }}
          >
            +
          </IconButton>
        </Stack>
        <Tooltip title="Move to ash heap">
          <span>
            <IconButton size="small" disabled={selectedInPlayCount === 0} onClick={onTrash} color="error">
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          size="small"
          disabled={librarySize === 0}
          onClick={() => act({ type: 'drawFromLibrary' })}
        >
          Draw Library ({librarySize})
        </Button>
        <Button variant="outlined" size="small" disabled={cryptSize === 0} onClick={() => act({ type: 'drawFromCrypt' })}>
          Draw Crypt ({cryptSize})
        </Button>
        <Box sx={{ flex: 1 }} />
        {phase === 'discard' ? (
          <Button variant="contained" color="warning" size="small" onClick={handleEndTurn}>
            End turn
          </Button>
        ) : (
          <Button variant="contained" size="small" onClick={() => act({ type: 'advancePhase' })}>
            Next phase ({nextPhaseLabel(phase).toLowerCase()})
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default GameActions
