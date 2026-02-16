import type { ReactNode } from 'react'

import GameLayoutShell from './GameLayoutShell'

type GameLayoutProps = {
  public: ReactNode
  player: ReactNode
  log: ReactNode
}

const GameLayout = ({ public: publicSlot, player, log }: GameLayoutProps) => (
  <GameLayoutShell public={publicSlot} player={player} log={log} />
)

export default GameLayout
