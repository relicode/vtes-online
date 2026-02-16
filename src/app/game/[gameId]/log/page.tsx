import Box from '@mui/material/Box'

import { getActionLog } from '$/actions/game-actions'
import ActionLogContent from '$/components/game/ActionLogContent'

type StandaloneLogPageProps = {
  params: Promise<{ gameId: string }>
}

const StandaloneLogPage = async ({ params }: StandaloneLogPageProps) => {
  const { gameId } = await params
  const result = await getActionLog(gameId)

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <ActionLogContent gameId={gameId} initialEntries={result.success ? result.data : []} />
    </Box>
  )
}

export default StandaloneLogPage
