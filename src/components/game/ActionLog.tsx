'use client'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import type { ActionLogEntry } from '$/types/game-actions'

type ActionLogProps = {
  entries: ActionLogEntry[]
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const ActionLog = ({ entries }: ActionLogProps) => (
  <Paper variant="outlined">
    <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5 }}>
      Action Log
    </Typography>
    <List dense disablePadding>
      {entries.length === 0 ? (
        <ListItem>
          <ListItemText secondary="No actions yet." />
        </ListItem>
      ) : (
        entries.map((entry) => (
          <ListItem key={entry.id}>
            <ListItemText
              primary={entry.description}
              secondary={formatTime(entry.timestamp)}
              slotProps={{ secondary: { variant: 'caption' } }}
            />
          </ListItem>
        ))
      )}
    </List>
  </Paper>
)

export default ActionLog
