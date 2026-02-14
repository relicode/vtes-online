'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type GamePollerProps = {
  children: React.ReactNode
  intervalMs?: number
}

const GamePoller = ({ children, intervalMs = 3000 }: GamePollerProps) => {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return <>{children}</>
}

export default GamePoller
