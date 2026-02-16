import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListSubheader from '@mui/material/ListSubheader'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import { listGames } from '$/actions/game-actions'
import { listUsers } from '$/actions/user-actions'
import VtesLink from '$/components/VtesLink'

const labelSx = { width: 80, flexShrink: 0, fontWeight: 'bold', fontSize: '0.75rem', color: 'text.secondary' } as const

const Home = async () => {
  const [gamesResult, usersResult] = await Promise.all([listGames(), listUsers()])
  const games = gamesResult.success ? gamesResult.data : []
  const users = usersResult.success ? usersResult.data : []

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        VTES Online
      </Typography>

      {games.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <List
            disablePadding
            subheader={
              <ListSubheader component="div" sx={{ lineHeight: '40px' }}>
                Games
              </ListSubheader>
            }
          >
            {games.map((game) => (
              <Box key={game.id}>
                <Divider />
                <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{game.name}</Typography>
                    <Chip label={game.status} size="small" color={game.status === 'active' ? 'success' : 'default'} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography sx={labelSx}>Spectate</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <VtesLink href={`/game/${game.id}`} underline="hover" variant="body2">
                        2D
                      </VtesLink>
                      <VtesLink href={`/game/${game.id}?gfx=3d`} underline="hover" variant="body2">
                        3D
                      </VtesLink>
                      <VtesLink href={`/game/${game.id}/log`} underline="hover" variant="body2">
                        Log
                      </VtesLink>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography sx={labelSx}>Play</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {game.players.map((p) => (
                        <VtesLink
                          key={p.playerId}
                          href={`/game/${game.id}/${p.playerId}`}
                          underline="hover"
                          variant="body2"
                        >
                          {p.name}
                        </VtesLink>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Typography sx={labelSx}>Standalone</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {game.players.map((p) => (
                        <VtesLink
                          key={p.playerId}
                          href={`/game/${game.id}/${p.playerId}/standalone`}
                          underline="hover"
                          variant="body2"
                        >
                          {p.name}
                        </VtesLink>
                      ))}
                    </Box>
                  </Box>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {users.length > 0 && (
        <Paper variant="outlined">
          <List
            disablePadding
            subheader={
              <ListSubheader component="div" sx={{ lineHeight: '40px' }}>
                Users
              </ListSubheader>
            }
          >
            {users.map((user) => (
              <Box key={user.id}>
                <Divider />
                <ListItem sx={{ py: 1 }}>
                  <VtesLink href={`/user/${user.id}`} underline="hover">
                    {user.name}
                  </VtesLink>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {games.length === 0 && users.length === 0 && (
        <Typography color="text.secondary">No data yet. Run npm run seed to populate.</Typography>
      )}
    </Container>
  )
}

export default Home
