'use client'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import type { ActionLogEntry } from '$/types/game-actions'

type ActionLogProps = {
  entries: ActionLogEntry[]
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const ActionLog = ({ entries }: ActionLogProps) => (
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
)

export default ActionLog
