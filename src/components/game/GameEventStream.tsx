'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 3000

type UseGameEventStreamOptions<T> = {
  gameId: string
  userId?: string
  initialState: T
}

const useGameEventStream = <T,>({ gameId, userId, initialState }: UseGameEventStreamOptions<T>) => {
  const [sseState, setSseState] = useState<T | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | undefined

    const params = userId ? `?userId=${userId}` : ''
    const eventSource = new EventSource(`/api/game/${gameId}/events${params}`)

    const startPolling = () => {
      if (!pollTimer) {
        pollTimer = setInterval(() => router.refresh(), POLL_INTERVAL_MS)
      }
    }

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = undefined
      }
    }

    eventSource.addEventListener('gameStateChanged', (event) => {
      setSseState(JSON.parse(event.data) as T)
    })

    eventSource.addEventListener('open', () => {
      stopPolling()
    })

    eventSource.addEventListener('error', () => {
      setSseState(undefined)
      startPolling()
    })

    return () => {
      eventSource.close()
      stopPolling()
    }
  }, [gameId, userId, router])

  return sseState ?? initialState
}

export default useGameEventStream
