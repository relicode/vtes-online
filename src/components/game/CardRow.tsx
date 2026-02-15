import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type CardRowProps = {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const CardRow = ({ title, actions, children }: CardRowProps) => (
  <div>
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
      <Typography variant="h5" textAlign="center">
        {title}
      </Typography>
      {actions}
    </Stack>
    <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {children}
    </Stack>
  </div>
)

export default CardRow
