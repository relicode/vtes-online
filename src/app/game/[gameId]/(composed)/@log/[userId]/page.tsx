import { getActionLog } from '$/actions/game-actions'
import ActionLogContent from '$/components/game/ActionLogContent'

type ActionLogPlayerPageProps = {
  params: Promise<{ gameId: string }>
}

const ActionLogPlayerPage = async ({ params }: ActionLogPlayerPageProps) => {
  const { gameId } = await params
  const result = await getActionLog(gameId)

  return <ActionLogContent gameId={gameId} initialEntries={result.success ? result.data : []} />
}

export default ActionLogPlayerPage
