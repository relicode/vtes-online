import { getActionLog } from '$/actions/game-actions'
import ActionLogContent from '$/components/game/ActionLogContent'

type ActionLogPageProps = {
  params: Promise<{ gameId: string }>
}

const ActionLogPage = async ({ params }: ActionLogPageProps) => {
  const { gameId } = await params
  const result = await getActionLog(gameId)

  return <ActionLogContent gameId={gameId} initialEntries={result.success ? result.data : []} />
}

export default ActionLogPage
