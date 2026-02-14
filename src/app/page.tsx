import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

const Home = () => (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
    <Typography variant="h1">VTES Online</Typography>
    <Typography sx={{ mb: 4 }}>Ma tahan kakelda</Typography>
    <Stack spacing={2}>
      <Link href="/user/test-user" style={{ textDecoration: 'none' }}>
        <Button variant="contained" size="large" fullWidth>
          My Decks
        </Button>
      </Link>
      <Link href="/game/test-game" style={{ textDecoration: 'none' }}>
        <Button variant="outlined" size="large" fullWidth>
          Spectate Game
        </Button>
      </Link>
      <Link href="/game/test-game/test-user" style={{ textDecoration: 'none' }}>
        <Button variant="outlined" size="large" fullWidth>
          Play Game
        </Button>
      </Link>
    </Stack>
  </Container>
)

export default Home
