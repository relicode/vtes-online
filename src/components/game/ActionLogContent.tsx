'use client'

import { useEffect, useState } from 'react'

import type { ActionLogEntry } from '$/types/game-actions'
import ActionLog from './ActionLog'

type ActionLogContentProps = {
  gameId: string
  initialEntries: ActionLogEntry[]
}

const ActionLogContent = ({ gameId, initialEntries }: ActionLogContentProps) => {
  const [entries, setEntries] = useState(initialEntries)

  useEffect(() => {
    const eventSource = new EventSource(`/api/game/${gameId}/events`)

    eventSource.addEventListener('gameStateChanged', (event) => {
      const data = JSON.parse(event.data) as { actionLog: ActionLogEntry[] }
      setEntries(data.actionLog)
    })

    return () => {
      eventSource.close()
    }
  }, [gameId])

  return <ActionLog entries={entries} />
}

export default ActionLogContent
