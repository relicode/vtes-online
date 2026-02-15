import Redis from 'ioredis'
import { type NextRequest } from 'next/server'

import { toGameSummary, toGameView } from '$/lib/game-views'
import redis from '$/lib/redis'
import type { GameState } from '$/types/game'
import type { ActionLogEntry } from '$/types/game-actions'

export const dynamic = 'force-dynamic'

const HEARTBEAT_INTERVAL_MS = 30_000
const DEBOUNCE_MS = 50

export const GET = (request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) => {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const { gameId } = await params
      const userId = request.nextUrl.searchParams.get('userId') ?? undefined
      const channel = `game:${gameId}:events`
      const subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
      let cleaned = false

      const enqueue = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text))
        } catch {
          cleanup()
        }
      }

      const fetchAndSend = async () => {
        try {
          if (userId) {
            const [raw, logEntries] = await Promise.all([
              redis.get(`game:${gameId}`),
              redis.lrange(`game:${gameId}:log`, 0, 49),
            ])
            if (!raw) return
            const game = JSON.parse(raw) as GameState
            if (!game.players[userId]) return
            const actionLog = logEntries.map((entry) => JSON.parse(entry) as ActionLogEntry)
            enqueue(`event: gameStateChanged\ndata: ${JSON.stringify(toGameView(game, userId, actionLog))}\n\n`)
          } else {
            const raw = await redis.get(`game:${gameId}`)
            if (!raw) return
            enqueue(`event: gameStateChanged\ndata: ${JSON.stringify(toGameSummary(JSON.parse(raw) as GameState))}\n\n`)
          }
        } catch {
          // Fetch failed; client will get the next update
        }
      }

      let debounceTimer: ReturnType<typeof setTimeout> | undefined
      const heartbeat = setInterval(() => enqueue(': heartbeat\n\n'), HEARTBEAT_INTERVAL_MS)

      const cleanup = () => {
        if (cleaned) return
        cleaned = true
        clearTimeout(debounceTimer)
        clearInterval(heartbeat)
        subscriber.unsubscribe(channel).catch(() => {})
        subscriber.quit().catch(() => {})
      }

      request.signal.addEventListener('abort', cleanup)

      subscriber.on('error', () => {
        cleanup()
        try {
          controller.close()
        } catch {
          // already closed
        }
      })

      subscriber.on('message', () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(fetchAndSend, DEBOUNCE_MS)
      })

      subscriber
        .subscribe(channel)
        .then(() => {
          enqueue(': connected\n\n')
          fetchAndSend()
        })
        .catch(() => {
          cleanup()
          controller.close()
        })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
